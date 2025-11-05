import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Client, StorageMemory } from "jsr:@mtkruto/mtkruto@0.74.0";

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

    const { accountId, recipient, message, messageId } = await req.json();

    console.log('Sending Telegram message:', { accountId, recipient, messageId });

    // Fetch account details
    const { data: account, error: accountError } = await supabase
      .from('telegram_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (accountError || !account) {
      throw new Error('Account not found or not authenticated');
    }

    if (!account.session_data) {
      throw new Error('Account not authenticated. Please authenticate first.');
    }

    // Initialize MTKruto client
    const client = new Client({
      storage: new StorageMemory(),
      apiId: parseInt(account.api_id),
      apiHash: account.api_hash,
    });

    // Import the session
    await client.importAuthString(account.session_data);
    await client.connect();

    // Send message using high-level API
    await client.sendMessage(recipient, message);

    await client.disconnect();

    // Update message status in database if messageId provided
    if (messageId) {
      const { error: updateError } = await supabase
        .from('scheduled_messages')
        .update({ status: 'sent' })
        .eq('id', messageId);

      if (updateError) {
        console.error('Failed to update message status:', updateError);
      }
    }

    console.log('Message sent successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Message sent successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Telegram send message error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || String(error) }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
