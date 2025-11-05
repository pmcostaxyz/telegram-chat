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

    console.log('Checking for scheduled messages...');

    // Get messages that are due to be sent
    const { data: messages, error: messagesError } = await supabase
      .from('scheduled_messages')
      .select(`
        *,
        telegram_accounts!inner(*)
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_time', new Date().toISOString());

    if (messagesError) {
      throw messagesError;
    }

    console.log(`Found ${messages?.length || 0} messages to send`);

    const results = [];

    for (const message of messages || []) {
      try {
        const account = message.telegram_accounts;

        if (!account.is_active || !account.session_data) {
          console.log(`Skipping message ${message.id}: account not active or not authenticated`);
          
          // Update message status to failed
          await supabase
            .from('scheduled_messages')
            .update({
              status: 'failed',
              error_message: 'Account not active or not authenticated',
            })
            .eq('id', message.id);

          results.push({
            id: message.id,
            success: false,
            error: 'Account not active or not authenticated',
          });
          continue;
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

        // Send message
        await client.sendMessage(message.recipient, message.message_text);

        await client.disconnect();

        // Update message status to sent
        const { error: updateError } = await supabase
          .from('scheduled_messages')
          .update({ status: 'sent' })
          .eq('id', message.id);

        if (updateError) {
          console.error('Failed to update message status:', updateError);
        }

        console.log(`Message ${message.id} sent successfully`);
        results.push({
          id: message.id,
          success: true,
        });
      } catch (error: any) {
        console.error(`Error sending message ${message.id}:`, error);

        // Update message status to failed
        await supabase
          .from('scheduled_messages')
          .update({
            status: 'failed',
            error_message: error.message || String(error),
          })
          .eq('id', message.id);

        results.push({
          id: message.id,
          success: false,
          error: error.message || String(error),
        });
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
      JSON.stringify({ error: error.message || String(error) }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
