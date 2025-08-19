const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Food Ordering Backend API',
      version: '1.0.0',
      description: 'REST API for authentication, browsing, cart, orders, and payments',
      contact: {
        name: 'Food Platform',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Local Dev',
      },
    ],
    tags: [
      { name: 'Health', description: 'Service health checks' },
      { name: 'Auth', description: 'User authentication and registration' },
      { name: 'Restaurants', description: 'Restaurants and menus' },
      { name: 'Cart', description: 'Cart management' },
      { name: 'Orders', description: 'Order placement and history' },
      { name: 'Payments', description: 'Payment flows (mock)' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
