// items
import  items  from '../items.js' 
// uuid 
import { v4 as uuidv4 } from 'uuid';

const getItems = (req, rep) => {
  rep.send(items);
}


const getItem = (req, rep) => {
    const { id } = req.params
    const item = items.find((item) => item.id == id)
    rep.send(item);
}

// const addItem = (req, rep) => {
//   const {name} = req.body
//   const item = {
//     id: uuidv4(),
//     name
//   }
//   
//   items = [...items, item]
//   reply.code(201).send(item)
// }

export default {
  getItems,
  getItem,
  // addItem,
}

