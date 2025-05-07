const dispHome = (req, rep) => { return rep.view('home.ejs', {text: 'Welcome'}) }

export default dispHome;
