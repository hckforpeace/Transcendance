
// Handler for index route
const dispIndex = (req, rep) => {
  rep.view('login.ejs', {
    text: 'login'
    // Add any other variables you might need
  })
}
export default dispIndex;
