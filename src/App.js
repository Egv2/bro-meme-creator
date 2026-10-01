import React from "react";

import Header from "./components/Header";
import CharacterEditor from "./components/CharacterEditor";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="appShell">
      <Header />
      <CharacterEditor />
      <Footer />
    </div>
  );
}

export default App;
