const dispHome = (req, rep) => {
  rep.view('home.ejs', {
    text: 'Welcome'
  })
}

export default dispHome;
