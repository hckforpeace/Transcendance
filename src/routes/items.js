import itemsControllers  from '../controllers/items.mjs'
const {getItems, getItem} = itemsControllers;

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
      },
    },
  },
  handler: getItems
}


// Options for getting one Item
const getItemOpts = {
  schema: {
    response: {
      200: Item, 
    },
  },
  handler: getItem
}

// Options for get all items
// const postItemOpts = {
//   schema: {
//     response: {
//       201: Item, 
//     },
//   },
//   handler: addItem,
// }

// routes
async function routes (fastify, options) {
  // get all items
  fastify.get('/items', getItemsOpts) 
  // get single id
  fastify.get('/items/:id', getItemOpts)
  // add item
  // fastify.post('items', postItemOpts)
}


// ESM 
export default routes;
