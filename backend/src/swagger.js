import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function mountSwagger(app) {
  const specs = swaggerJSDoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Mini Social Network API',
        version: '1.0.0',
        description: 'A comprehensive REST API for a mini social network with authentication, posts, comments, likes, chat, and notifications',
        contact: {
          name: 'API Support',
          email: 'support@minisocial.com'
        }
      },
      servers: [
        {
          url: 'https://social.local/api',
          description: 'Local development (via Nginx proxy)'
        },
        {
          url: 'http://localhost:4000',
          description: 'Backend direct (without proxy)'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter your JWT token'
          },
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'authToken',
            description: 'Authentication cookie'
          }
        },
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                description: 'User ID',
                example: 1
              },
              username: {
                type: 'string',
                description: 'Username (unique)',
                example: 'johndoe'
              },
              email: {
                type: 'string',
                format: 'email',
                description: 'User email (unique)',
                example: 'john@example.com'
              },
              created_at: {
                type: 'string',
                format: 'date-time',
                description: 'Account creation timestamp',
                example: '2024-01-15T10:30:00.000Z'
              }
            }
          },
          Post: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                description: 'Post ID',
                example: 1
              },
              user_id: {
                type: 'integer',
                description: 'ID of the user who created the post',
                example: 1
              },
              content: {
                type: 'string',
                description: 'Post content/text',
                example: 'This is my first post!'
              },
              created_at: {
                type: 'string',
                format: 'date-time',
                description: 'Post creation timestamp',
                example: '2024-01-15T10:30:00.000Z'
              }
            }
          },
          Comment: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                description: 'Comment ID',
                example: 1
              },
              post_id: {
                type: 'integer',
                description: 'ID of the post this comment belongs to',
                example: 1
              },
              user_id: {
                type: 'integer',
                description: 'ID of the user who created the comment',
                example: 2
              },
              content: {
                type: 'string',
                description: 'Comment content/text',
                example: 'Great post!'
              },
              created_at: {
                type: 'string',
                format: 'date-time',
                description: 'Comment creation timestamp',
                example: '2024-01-15T10:35:00.000Z'
              }
            }
          },
          Like: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                description: 'Like ID',
                example: 1
              },
              user_id: {
                type: 'integer',
                description: 'ID of the user who liked the post',
                example: 1
              },
              post_id: {
                type: 'integer',
                description: 'ID of the post that was liked',
                example: 1
              },
              created_at: {
                type: 'string',
                format: 'date-time',
                description: 'Like timestamp',
                example: '2024-01-15T10:32:00.000Z'
              }
            }
          },
          Notification: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                description: 'Notification ID',
                example: 1
              },
              user_id: {
                type: 'integer',
                description: 'ID of the user who receives the notification',
                example: 1
              },
              actor_id: {
                type: 'integer',
                description: 'ID of the user who triggered the notification',
                example: 2
              },
              type: {
                type: 'string',
                enum: ['like', 'comment', 'follow'],
                description: 'Type of notification',
                example: 'like'
              },
              ref_id: {
                type: 'integer',
                nullable: true,
                description: 'Reference ID (e.g., post_id for likes/comments)',
                example: 1
              },
              seen: {
                type: 'boolean',
                description: 'Whether the notification has been seen',
                example: false
              },
              created_at: {
                type: 'string',
                format: 'date-time',
                description: 'Notification creation timestamp',
                example: '2024-01-15T10:33:00.000Z'
              }
            }
          },
          Message: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                description: 'Message ID',
                example: 1
              },
              sender_id: {
                type: 'integer',
                description: 'ID of the user who sent the message',
                example: 1
              },
              recipient_id: {
                type: 'integer',
                description: 'ID of the user who receives the message',
                example: 2
              },
              content: {
                type: 'string',
                description: 'Message content/text',
                example: 'Hello, how are you?'
              },
              created_at: {
                type: 'string',
                format: 'date-time',
                description: 'Message timestamp',
                example: '2024-01-15T10:40:00.000Z'
              }
            }
          },
          Follow: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                description: 'Follow relationship ID',
                example: 1
              },
              follower_id: {
                type: 'integer',
                description: 'ID of the user who is following',
                example: 1
              },
              following_id: {
                type: 'integer',
                description: 'ID of the user being followed',
                example: 2
              },
              created_at: {
                type: 'string',
                format: 'date-time',
                description: 'Follow timestamp',
                example: '2024-01-15T10:28:00.000Z'
              }
            }
          },
          Error: {
            type: 'object',
            properties: {
              error: {
                type: 'string',
                description: 'Error message',
                example: 'An error occurred'
              }
            }
          }
        }
      },
      tags: [
        {
          name: 'Health',
          description: 'API health check endpoints'
        },
        {
          name: 'Authentication',
          description: 'User authentication endpoints (register, login, logout)'
        },
        {
          name: 'Users',
          description: 'User profile and follow management endpoints'
        },
        {
          name: 'Posts',
          description: 'Post creation, feed, and deletion endpoints'
        },
        {
          name: 'Comments',
          description: 'Comment creation, retrieval, and deletion endpoints'
        },
        {
          name: 'Likes',
          description: 'Like/unlike post endpoints'
        },
        {
          name: 'Chat',
          description: 'Direct messaging endpoints'
        },
        {
          name: 'Notifications',
          description: 'Notification retrieval and management endpoints'
        }
      ]
    },
    apis: [
      join(__dirname, 'routes', '*.js'),
      join(__dirname, 'index.js')
    ]
  })

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customSiteTitle: 'Mini Social API Documentation',
    customCss: '.swagger-ui .topbar { display: none }'
  }))
}
