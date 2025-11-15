import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/home-style.css";

function Home() {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("Name");

    const constellations = [
        {
            id: 1,
            name: "",
            description: "",
            image: "",
        },
    ];

    const filtered = constellations
        .filter((c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
        )
        .sort((a, b) =>
            sortOption === "Name" ? a.name.localeCompare(b.name) : a.id - b.id
        );

    return (
        <div id="home-div" className="box">
            <header id="home-header">
                <h1 id="home-title" className="primary-text">Constellation Gallery</h1>
                <p id="welcome-text" className="secondary-text">Welcome, !</p>
            </header>

            <div id="home-controls">
                <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="accent"
                />
                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="accent"
                >
                    <option value="Name">Sorting: Name</option>
                    <option value="Date">Sorting: Date</option>
                </select>
                <button
                    id="new-constellation"
                    className="accent"
                    onClick={() => navigate("/new-constellation")}
                >
                    New Constellation
                </button>
            </div>

            <div id="constellation-grid">
                {filtered.map((c) => (
                    <div key={c.id} className="constellation-card">
                        <img
                            src={c.image}
                            alt={c.name}
                            className="constellation-image"
                            onClick={() => navigate(`/constellation/${c.id}`)}
                        />
                        <h3 className="primary-text">{c.name}</h3>
                        <p className="secondary-text">{c.description}</p>
                    </div>
                ))}

                {Array.from({ length: Math.max(0, 8 - filtered.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="constellation-empty"></div>
                ))}
            </div>
        </div>
    );
}

export default Home;
