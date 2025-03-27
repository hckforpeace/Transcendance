const dispIndex = (req, rep) => {
  rep.view("index.ejs", {body: "Kess emak "})
}

export default dispIndex;
