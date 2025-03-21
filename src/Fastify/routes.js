// items
import  items  from './items.js' 

// Item schema 
const Item = {
  schema: {
    response: {
      200: {
        type: 'object',
          properties: {
            id: {type: 'string'},
            name: {type: 'string'},
          },
      },
    },
  },
}

// Options for get all items
const getItemsOpts = {
  schema: {
    response: {
      200:  {
        type: 'array',
        items: Item,
      }
    }
  }
}

// Options for getting one Item
const getItemOpts = {
  schema: {
    response: {
      200: Item, 
    },
  },
}


// routes
async function routes (fastify, options) {
  // get all items
  fastify.get('/items', getItemsOpts, (req, rep) => {
    rep.send(items);
  })

  // get single id
  fastify.get('/items/:id', getItemOpts, (req, rep) => {
    
    const { id } = req.params

    const item = items.find((item) => item.id == id)

    rep.send(item);
  })
}


// ESM 
export default routes;
