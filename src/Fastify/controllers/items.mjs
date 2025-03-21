// items
import  items  from '../items.js' 

const getItems = (req, rep) => {
  rep.send(items);
}


const getItem = (req, rep) => {
    const { id } = req.params
    const item = items.find((item) => item.id == id)
    rep.send(item);
}

export default {
  getItems,
  getItem,
}
