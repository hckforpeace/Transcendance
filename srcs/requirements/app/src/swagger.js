// Register Swagger for API documentation
const PORT = 8080;
const swg_config = {
  swagger: {
    info: {
      title: 'Your API',
      description: 'API documentation',
      version: '1.0.0'
    },
    host: `localhost:${PORT}`,
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json']
  }
}

// Register Swagger UI
const swgUI_config =  {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  }
}

export default {swg_config, swgUI_config}
