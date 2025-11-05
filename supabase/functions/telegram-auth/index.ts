import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Client, StorageMemory } from "https://deno.land/x/mtkruto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, accountId, phoneCode } = await req.json();

    console.log('Telegram auth action:', action, 'for account:', accountId);

    // Fetch account details
    const { data: account, error: accountError } = await supabase
      .from('telegram_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      throw new Error('Account not found');
    }

    // Initialize MTKruto client
    const client = new Client({
      storage: new StorageMemory(),
      apiId: parseInt(account.api_id),
      apiHash: account.api_hash,
    });

    // Import existing session if available
    if (account.session_data) {
      try {
        await client.importAuthString(account.session_data);
      } catch (e) {
        console.log('Could not import existing session, starting fresh');
      }
    }

    await client.connect();

    if (action === 'send_code') {
      // Send verification code using MTProto API
      const result = await client.invoke({
        _: 'auth.sendCode',
        phone_number: account.phone_number,
        api_id: parseInt(account.api_id),
        api_hash: account.api_hash,
        settings: {
          _: 'codeSettings',
        },
      });

      await client.disconnect();

      return new Response(
        JSON.stringify({
          success: true,
          phoneCodeHash: result.phone_code_hash,
          message: 'Verification code sent to your Telegram account',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify_code') {
      try {
        // Sign in with the verification code
        const signInResult = await client.invoke({
          _: 'auth.signIn',
          phone_number: account.phone_number,
          phone_code_hash: phoneCode.hash,
          phone_code: phoneCode.code,
        });

        // Export the auth string for storage
        const authString = await client.exportAuthString();

        await client.disconnect();

        // Update session in database
        const { error: updateError } = await supabase
          .from('telegram_accounts')
          .update({
            session_data: authString,
            is_active: true,
          })
          .eq('id', accountId);

        if (updateError) {
          throw new Error('Failed to save session');
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Successfully authenticated with Telegram',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        await client.disconnect();
        
        // Check if 2FA is required
        if (error.error_message === 'SESSION_PASSWORD_NEEDED') {
          return new Response(
            JSON.stringify({
              success: false,
              requires2FA: true,
              message: '2FA password required',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw error;
      }
    }

    if (action === 'verify_password') {
      throw new Error('2FA authentication must be done through Telegram app first. After authenticating there, the session will be available.');
    }

    throw new Error('Invalid action');

  } catch (error: any) {
    console.error('Telegram auth error:', error);
    return new Response(
      JSON.stringify({ error: error.message || String(error) }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
