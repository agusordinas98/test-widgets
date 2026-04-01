function HelloWorld() {
  console.log("Inicio del script");
  console.log("Esperando 8 segundos");
  setTimeout(() => {
    console.log("Ya pasaron 8 segundos");
    const routeInfoDiv = document.getElementById("routeInfo");
    if (!routeInfoDiv) {
      console.error("Element with ID 'routeInfo' not found!");
      return;
    }
    routeInfoDiv.innerHTML = "<p>Hello World</p>";
  }, 8000);

}

HelloWorld();


