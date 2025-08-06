export interface WebhookExample {
  name: string;
  body: string;
}

export interface WebhookPreset {
  name: string;
  description: string;
  url: string;
  method: string;
  headers: string;
  body: string;
  examples: WebhookExample[];
}

export const webhookPresets: Record<string, WebhookPreset> = {
  discord: {
    name: "Discord",
    description: "Send messages to Discord channels",
    url: "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN",
    method: "POST",
    headers: JSON.stringify({
      "Content-Type": "application/json"
    }, null, 2),
    body: JSON.stringify({
      content: "Hello from webhook tester!",
      username: "Webhook Bot",
      avatar_url: "https://example.com/avatar.png"
    }, null, 2),
    examples: [
      {
        name: "Simple Message",
        body: JSON.stringify({
          content: "Hello from webhook tester!"
        }, null, 2)
      },
      {
        name: "Embed Message",
        body: JSON.stringify({
          embeds: [{
            title: "Test Notification",
            description: "This is a test message from webhook tester",
            color: 3447003,
            fields: [
              {
                name: "Status",
                value: "✅ Success",
                inline: true
              },
              {
                name: "Time",
                value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                inline: true
              }
            ]
          }]
        }, null, 2)
      },
      {
        name: "Rich Embed",
        body: JSON.stringify({
          embeds: [{
            title: "System Alert",
            description: "A test notification from the webhook tester",
            color: 15158332,
            thumbnail: {
              url: "https://example.com/icon.png"
            },
            fields: [
              {
                name: "🔴 Status",
                value: "Critical",
                inline: true
              },
              {
                name: "📊 Priority",
                value: "High",
                inline: true
              },
              {
                name: "📝 Details",
                value: "This is a detailed test message with multiple fields and formatting",
                inline: false
              }
            ],
            footer: {
              text: "Webhook Tester • " + new Date().toLocaleDateString()
            },
            timestamp: new Date().toISOString()
          }]
        }, null, 2)
      }
    ]
  },
  slack: {
    name: "Slack",
    description: "Send messages to Slack channels",
    url: "https://hooks.slack.com/services/YOUR_WORKSPACE/YOUR_CHANNEL/YOUR_TOKEN",
    method: "POST",
    headers: JSON.stringify({
      "Content-Type": "application/json"
    }, null, 2),
    body: JSON.stringify({
      text: "Hello from webhook tester!"
    }, null, 2),
    examples: [
      {
        name: "Simple Message",
        body: JSON.stringify({
          text: "Hello from webhook tester!"
        }, null, 2)
      },
      {
        name: "Rich Message",
        body: JSON.stringify({
          attachments: [{
            color: "good",
            title: "Test Notification",
            text: "This is a test message from webhook tester",
            fields: [
              {
                title: "Status",
                value: "✅ Success",
                short: true
              },
              {
                title: "Time",
                value: new Date().toLocaleString(),
                short: true
              }
            ]
          }]
        }, null, 2)
      },
      {
        name: "Interactive Message",
        body: JSON.stringify({
          text: "Choose an action:",
          attachments: [{
            text: "Test notification from webhook tester",
            fallback: "You are unable to choose an action",
            callback_id: "test_action",
            color: "#3AA3E3",
            attachment_type: "default",
            actions: [
              {
                name: "approve",
                text: "Approve",
                type: "button",
                value: "approve",
                style: "primary"
              },
              {
                name: "reject",
                text: "Reject",
                type: "button",
                value: "reject",
                style: "danger"
              }
            ]
          }]
        }, null, 2)
      }
    ]
  },
  github: {
    name: "GitHub",
    description: "Trigger GitHub repository webhooks",
    url: "https://api.github.com/repos/OWNER/REPO/dispatches",
    method: "POST",
    headers: JSON.stringify({
      "Content-Type": "application/json",
      "Authorization": "token YOUR_GITHUB_TOKEN",
      "Accept": "application/vnd.github.v3+json"
    }, null, 2),
    body: JSON.stringify({
      event_type: "test_event",
      client_payload: {
        message: "Hello from webhook tester!"
      }
    }, null, 2),
    examples: [
      {
        name: "Repository Dispatch",
        body: JSON.stringify({
          event_type: "test_event",
          client_payload: {
            message: "Hello from webhook tester!"
          }
        }, null, 2)
      },
      {
        name: "Issue Comment",
        body: JSON.stringify({
          event_type: "issue_comment",
          client_payload: {
            action: "created",
            issue: {
              number: 1,
              title: "Test Issue"
            },
            comment: {
              body: "Test comment from webhook"
            }
          }
        }, null, 2)
      },
      {
        name: "Deployment",
        body: JSON.stringify({
          event_type: "deployment",
          client_payload: {
            environment: "production",
            ref: "main",
            task: "deploy",
            auto_merge: false,
            required_contexts: [],
            payload: {
              deploy_id: "test-123"
            }
          }
        }, null, 2)
      }
    ]
  },
  teams: {
    name: "Microsoft Teams",
    description: "Send messages to Teams channels",
    url: "https://YOUR_ORG.webhook.office.com/webhookb2/YOUR_WEBHOOK_ID/IncomingWebhook/YOUR_TOKEN/YOUR_CHANNEL_ID",
    method: "POST",
    headers: JSON.stringify({
      "Content-Type": "application/json"
    }, null, 2),
    body: JSON.stringify({
      text: "Hello from webhook tester!"
    }, null, 2),
    examples: [
      {
        name: "Simple Message",
        body: JSON.stringify({
          text: "Hello from webhook tester!"
        }, null, 2)
      },
      {
        name: "Card Message",
        body: JSON.stringify({
          "@type": "MessageCard",
          "@context": "http://schema.org/extensions",
          "themeColor": "0076D7",
          "summary": "Test Notification",
          "sections": [
            {
              "activityTitle": "Test Notification",
              "activitySubtitle": "From Webhook Tester",
              "activityImage": "https://example.com/icon.png",
              "facts": [
                {
                  "name": "Status:",
                  "value": "✅ Success"
                },
                {
                  "name": "Time:",
                  "value": new Date().toLocaleString()
                }
              ],
              "markdown": true
            }
          ]
        }, null, 2)
      },
      {
        name: "Action Card",
        body: JSON.stringify({
          "@type": "MessageCard",
          "@context": "http://schema.org/extensions",
          "themeColor": "0076D7",
          "summary": "Action Required",
          "sections": [
            {
              "activityTitle": "Action Required",
              "activitySubtitle": "Please review this request",
              "text": "A test action is required from the webhook tester",
              "facts": [
                {
                  "name": "Priority:",
                  "value": "High"
                },
                {
                  "name": "Due Date:",
                  "value": new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()
                }
              ]
            }
          ],
          "potentialAction": [
            {
              "@type": "OpenUri",
              "name": "View Details",
              "targets": [
                {
                  "os": "default",
                  "uri": "https://example.com/details"
                }
              ]
            },
            {
              "@type": "HttpPOST",
              "name": "Approve",
              "target": "https://example.com/approve"
            }
          ]
        }, null, 2)
      }
    ]
  },
  telegram: {
    name: "Telegram",
    description: "Send messages to Telegram bots",
    url: "https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage",
    method: "POST",
    headers: JSON.stringify({
      "Content-Type": "application/json"
    }, null, 2),
    body: JSON.stringify({
      chat_id: "YOUR_CHAT_ID",
      text: "Hello from webhook tester!"
    }, null, 2),
    examples: [
      {
        name: "Simple Message",
        body: JSON.stringify({
          chat_id: "YOUR_CHAT_ID",
          text: "Hello from webhook tester!"
        }, null, 2)
      },
      {
        name: "Formatted Message",
        body: JSON.stringify({
          chat_id: "YOUR_CHAT_ID",
          text: "*Test Notification*\n\nThis is a test message from webhook tester\n\n✅ Status: Success\n🕐 Time: " + new Date().toLocaleString(),
          parse_mode: "Markdown"
        }, null, 2)
      },
      {
        name: "Inline Keyboard",
        body: JSON.stringify({
          chat_id: "YOUR_CHAT_ID",
          text: "Choose an action:",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Approve",
                  callback_data: "approve"
                },
                {
                  text: "❌ Reject",
                  callback_data: "reject"
                }
              ],
              [
                {
                  text: "📊 View Details",
                  url: "https://example.com/details"
                }
              ]
            ]
          }
        }, null, 2)
      }
    ]
  },
  zapier: {
    name: "Zapier",
    description: "Trigger Zapier webhooks",
    url: "https://hooks.zapier.com/hooks/catch/YOUR_ZAP_ID/YOUR_WEBHOOK_ID/",
    method: "POST",
    headers: JSON.stringify({
      "Content-Type": "application/json"
    }, null, 2),
    body: JSON.stringify({
      message: "Hello from webhook tester!",
      timestamp: new Date().toISOString()
    }, null, 2),
    examples: [
      {
        name: "Simple Data",
        body: JSON.stringify({
          message: "Hello from webhook tester!",
          timestamp: new Date().toISOString()
        }, null, 2)
      },
      {
        name: "Complex Data",
        body: JSON.stringify({
          event: "user_action",
          data: {
            user_id: "12345",
            action: "login",
            timestamp: new Date().toISOString(),
            metadata: {
              ip: "192.168.1.1",
              user_agent: "WebhookTester/1.0"
            }
          }
        }, null, 2)
      },
      {
        name: "E-commerce Event",
        body: JSON.stringify({
          event_type: "order_created",
          order: {
            id: "ORD-12345",
            customer: {
              email: "customer@example.com",
              name: "John Doe"
            },
            items: [
              {
                product_id: "PROD-001",
                name: "Test Product",
                quantity: 2,
                price: 29.99
              }
            ],
            total: 59.98,
            currency: "USD",
            status: "pending"
          },
          timestamp: new Date().toISOString()
        }, null, 2)
      }
    ]
  },
  notion: {
    name: "Notion",
    description: "Create pages in Notion databases",
    url: "https://api.notion.com/v1/pages",
    method: "POST",
    headers: JSON.stringify({
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_NOTION_TOKEN",
      "Notion-Version": "2022-06-28"
    }, null, 2),
    body: JSON.stringify({
      parent: {
        database_id: "YOUR_DATABASE_ID"
      },
      properties: {
        "Title": {
          "title": [
            {
              "text": {
                "content": "Test Page from Webhook"
              }
            }
          ]
        },
        "Status": {
          "select": {
            "name": "In Progress"
          }
        }
      }
    }, null, 2),
    examples: [
      {
        name: "Simple Page",
        body: JSON.stringify({
          parent: {
            database_id: "YOUR_DATABASE_ID"
          },
          properties: {
            "Title": {
              "title": [
                {
                  "text": {
                    "content": "Test Page from Webhook"
                  }
                }
              ]
            }
          }
        }, null, 2)
      },
      {
        name: "Rich Page",
        body: JSON.stringify({
          parent: {
            database_id: "YOUR_DATABASE_ID"
          },
          properties: {
            "Title": {
              "title": [
                {
                  "text": {
                    "content": "Project Update"
                  }
                }
              ]
            },
            "Status": {
              "select": {
                "name": "Complete"
              }
            },
            "Priority": {
              "select": {
                "name": "High"
              }
            },
            "Due Date": {
              "date": {
                "start": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              }
            }
          },
          children: [
            {
              "object": "block",
              "type": "paragraph",
              "paragraph": {
                "rich_text": [
                  {
                    "type": "text",
                    "text": {
                      "content": "This is a test page created via webhook from the webhook tester."
                    }
                  }
                ]
              }
            }
          ]
        }, null, 2)
      }
    ]
  },
  airtable: {
    name: "Airtable",
    description: "Create records in Airtable bases",
    url: "https://api.airtable.com/v0/YOUR_BASE_ID/YOUR_TABLE_NAME",
    method: "POST",
    headers: JSON.stringify({
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_AIRTABLE_API_KEY"
    }, null, 2),
    body: JSON.stringify({
      records: [
        {
          fields: {
            "Name": "Test Record",
            "Status": "Active",
            "Notes": "Created via webhook tester"
          }
        }
      ]
    }, null, 2),
    examples: [
      {
        name: "Single Record",
        body: JSON.stringify({
          records: [
            {
              fields: {
                "Name": "Test Record",
                "Status": "Active",
                "Notes": "Created via webhook tester"
              }
            }
          ]
        }, null, 2)
      },
      {
        name: "Multiple Records",
        body: JSON.stringify({
          records: [
            {
              fields: {
                "Name": "Task 1",
                "Priority": "High",
                "Due Date": new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              }
            },
            {
              fields: {
                "Name": "Task 2",
                "Priority": "Medium",
                "Due Date": new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              }
            }
          ]
        }, null, 2)
      }
    ]
  }
}; 