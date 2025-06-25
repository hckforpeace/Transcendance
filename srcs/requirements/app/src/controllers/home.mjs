const dispHome = (req, rep) => { return rep.view('../public/html/home.html', {text: 'Welcome'}) }

export default dispHome;
