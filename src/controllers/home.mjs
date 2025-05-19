const dispHome = (req, rep) => { return rep.view('stats.html', {text: 'Welcome'}) }

export default dispHome;
