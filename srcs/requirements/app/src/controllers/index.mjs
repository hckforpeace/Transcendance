// const dispIndex = (req, rep) => {
//   rep.view("index.ejs", {body: "Kess emak "})
// }
// const dispIndex = (req, rep) => {
//   rep.view(null, 'login.ejs', {
//     text: 'kess emak',
//   })
// }
// Handler for index route
const dispIndex = (req, rep) => {
  rep.view('login.ejs', {
    text: 'login'
    // Add any other variables you might need
  })
}
export default dispIndex;
