import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { TelegramClient } from "https://esm.sh/telegram@2.22.2";
import { StringSession } from "https://esm.sh/telegram@2.22.2/sessions";

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

    console.log('Checking for scheduled messages...');

    // Fetch messages that are scheduled and due
    const { data: messages, error: messagesError } = await supabase
      .from('scheduled_messages')
      .select('*, telegram_accounts(*)')
      .eq('status', 'scheduled')
      .lte('scheduled_time', new Date().toISOString());

    if (messagesError) {
      throw messagesError;
    }

    if (!messages || messages.length === 0) {
      console.log('No scheduled messages to send');
      return new Response(
        JSON.stringify({ message: 'No scheduled messages to send' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${messages.length} messages to send`);

    const results = [];

    for (const msg of messages) {
      try {
        const account = msg.telegram_accounts;
        
        if (!account || !account.session_data || !account.is_active) {
          console.error(`Account not ready for message ${msg.id}`);
          await supabase
            .from('scheduled_messages')
            .update({
              status: 'failed',
              error_message: 'Account not authenticated or inactive',
            })
            .eq('id', msg.id);
          continue;
        }

        // Initialize Telegram client
        const stringSession = new StringSession(account.session_data);
        const client = new TelegramClient(
          stringSession,
          parseInt(account.api_id),
          account.api_hash,
          {
            connectionRetries: 5,
          }
        );

        await client.connect();
        await client.sendMessage(msg.recipient, { message: msg.message_text });
        await client.disconnect();

        // Update message status
        await supabase
          .from('scheduled_messages')
          .update({ status: 'sent' })
          .eq('id', msg.id);

        results.push({ id: msg.id, status: 'sent' });
        console.log(`Message ${msg.id} sent successfully`);

      } catch (error: any) {
        console.error(`Failed to send message ${msg.id}:`, error);
        
        await supabase
          .from('scheduled_messages')
          .update({
            status: 'failed',
            error_message: error.message,
          })
          .eq('id', msg.id);

        results.push({ id: msg.id, status: 'failed', error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Check scheduled messages error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
