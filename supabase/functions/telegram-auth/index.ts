import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { TelegramClient } from "https://esm.sh/telegram@2.22.2";
import { StringSession } from "https://esm.sh/telegram@2.22.2/sessions";
import { Api } from "https://esm.sh/telegram@2.22.2";

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

    const { action, accountId, apiId, apiHash, phoneNumber, phoneCode, password } = await req.json();

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

    const stringSession = new StringSession(account.session_data || '');
    const client = new TelegramClient(
      stringSession,
      parseInt(account.api_id),
      account.api_hash,
      {
        connectionRetries: 5,
      }
    );

    if (action === 'send_code') {
      await client.connect();
      const result = await client.sendCode(
        {
          apiId: parseInt(account.api_id),
          apiHash: account.api_hash,
        },
        account.phone_number
      );

      return new Response(
        JSON.stringify({
          success: true,
          phoneCodeHash: result.phoneCodeHash,
          message: 'Verification code sent to your Telegram account',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify_code') {
      await client.connect();
      
      try {
        await client.invoke(
          new Api.auth.SignIn({
            phoneNumber: account.phone_number,
            phoneCodeHash: phoneCode.hash,
            phoneCode: phoneCode.code,
          })
        );
      } catch (error: any) {
        if (error.errorMessage === 'SESSION_PASSWORD_NEEDED') {
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

      const sessionString = client.session.save();
      
      // Update session in database
      const { error: updateError } = await supabase
        .from('telegram_accounts')
        .update({
          session_data: sessionString,
          is_active: true,
        })
        .eq('id', accountId);

      if (updateError) {
        throw new Error('Failed to save session');
      }

      await client.disconnect();

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Successfully authenticated with Telegram',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify_password') {
      // 2FA authentication is complex and requires proper SRP implementation
      // For now, we'll require users to authenticate via official Telegram clients first
      throw new Error('2FA authentication must be done through Telegram app first. After authenticating there, the session will be available.');
    }

    throw new Error('Invalid action');

  } catch (error: any) {
    console.error('Telegram auth error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
