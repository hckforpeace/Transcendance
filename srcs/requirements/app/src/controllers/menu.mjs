const getProfileView = (req, reply) => {
  reply.sendFile('html/stats.html')  
}

export default {getProfileView}
