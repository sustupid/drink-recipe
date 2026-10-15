
import { useEffect, useState } from "react";
import "./App.css";

const API = "https://www.thecocktaildb.com/api/json/v1/1";

function App() {
  const [search, setSearch] = useState("");
  const [drinks, setDrinks] = useState([]);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [favourites, setFavourites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favourites")) || [];
    } catch {
      return [];
    }
  });
  const [showFavourites, setShowFavourites] = useState(false);

  async function searchDrinks(name) {
    setLoading(true);
    setError("");
    setShowFavourites(false);

    try {
      const response = await fetch(
        `${API}/search.php?s=${encodeURIComponent(name)}`
      );

      if (!response.ok) {
        throw new Error("Unable to load recipes");
      }

      const data = await response.json();
      setDrinks(data.drinks || []);
    } catch {
      setError("Something went wrong. Please try again.");
      setDrinks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    searchDrinks("margarita");
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) {
      searchDrinks(search.trim());
    }
  }

  function toggleFavourite(drink) {
    const exists = favourites.some(
      (item) => item.idDrink === drink.idDrink
    );

    const updated = exists
      ? favourites.filter((item) => item.idDrink !== drink.idDrink)
      : [...favourites, drink];

    setFavourites(updated);
    localStorage.setItem("favourites", JSON.stringify(updated));
  }

  function getIngredients(drink) {
    const ingredients = [];

    for (let i = 1; i <= 15; i++) {
      const ingredient = drink[`strIngredient${i}`];
      const measure = drink[`strMeasure${i}`];

      if (ingredient?.trim()) {
        ingredients.push(
          `${measure || ""} ${ingredient}`.trim()
        );
      }
    }

    return ingredients;
  }

  const displayedDrinks = showFavourites ? favourites : drinks;

  return (
    <div className="app">
      <nav className="navbar">
        <div
          className="logo"
          onClick={() => {
            setShowFavourites(false);
            searchDrinks("margarita");
          }}
        >
          THE DRINK EDIT<span>.</span>
        </div>

        <div className="nav-links">
          <button
            className="nav-button"
            onClick={() => searchDrinks("margarita")}
          >
            Explore
          </button>
          <button
            className="nav-button"
            onClick={() => setShowFavourites(true)}
          >
            Favourites ({favourites.length})
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="eyebrow">THE ART OF A GOOD DRINK</div>
        <h1>
          Find your <em>perfect</em> pour.
        </h1>
        <p>
          From timeless classics to fresh discoveries.
          Find the drink that fits your mood.
        </p>

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cocktails, ingredients, flavours..."
          />
          <button type="submit">Find a drink →</button>
        </form>
      </section>

      <main className="content">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {showFavourites ? "YOUR COLLECTION" : "DISCOVER & ENJOY"}
            </span>
            <h2>
              {showFavourites ? "Saved recipes" : "Explore recipes"}
            </h2>
          </div>
          <span className="count">
            {displayedDrinks.length} recipes
          </span>
        </div>

        {loading && <p className="message">Finding recipes...</p>}
        {error && <p className="message">{error}</p>}

        {!loading && !error && displayedDrinks.length === 0 && (
          <p className="message">
            No recipes found. Try another search.
          </p>
        )}

        {!loading && (
          <div className="drink-grid">
            {displayedDrinks.map((drink) => {
              const isFavourite = favourites.some(
                (item) => item.idDrink === drink.idDrink
              );

              return (
                <article className="drink-card" key={drink.idDrink}>
                  <div className="image-wrapper">
                    <img
                      src={drink.strDrinkThumb}
                      alt={drink.strDrink}
                    />
                    <button
                      className="heart-button"
                      onClick={() => toggleFavourite(drink)}
                      aria-label="Toggle favourite"
                    >
                      {isFavourite ? "♥" : "♡"}
                    </button>
                  </div>

                  <div className="card-info">
                    <span className="category">
                      {drink.strCategory}
                    </span>
                    <h3>{drink.strDrink}</h3>
                    <button
                      className="recipe-link"
                      onClick={() => setSelectedDrink(drink)}
                    >
                      View recipe <span>↗</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {selectedDrink && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedDrink(null)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={selectedDrink.strDrink}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-button"
              onClick={() => setSelectedDrink(null)}
            >
              ✕
            </button>

            <img
              className="modal-image"
              src={selectedDrink.strDrinkThumb}
              alt={selectedDrink.strDrink}
            />

            <div className="modal-content">
              <span className="eyebrow">
                {selectedDrink.strCategory}
              </span>
              <h2>{selectedDrink.strDrink}</h2>

              <h3>Ingredients</h3>
              <ul>
                {getIngredients(selectedDrink).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <h3>Method</h3>
              <p>
                {selectedDrink.strInstructionsEN ||
                  selectedDrink.strInstructions}
              </p>
            </div>
          </div>
        </div>
      )}

      <footer>
        <div className="footer-logo">THE DRINK EDIT.</div>
        <p>A little inspiration, one drink at a time.</p>
        <span>© 2026 The Drink Edit · React Capstone Project</span>
      </footer>
    </div>
  );
}

export default App;
