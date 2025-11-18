import Aries from "../assets/Aries.jpg";
import Taurus from "../assets/Taurus.jpg";
import Gemini from "../assets/Gemini.jpg";
import Cancer from "../assets/Cancer.jpg";
import Leo from "../assets/Leo.jpg";
import Virgo from "../assets/Virgo.jpg";
import Libra from "../assets/Libra.jpg";
import Scorpius from "../assets/Scorpius.jpg";
import Sagittarius from "../assets/Sagittarius.jpg";
import Capricornus from "../assets/Capricornus.jpg";
import Aquarius from "../assets/Aquarius.jpg";
import Pisces from "../assets/Pisces.jpg";

function Gallery() {
    return(
        <div id="gallery-div">
            <header id="gallery-header">
                <h1 id="gallery-title" className="primary-text">Gallery</h1>
            </header>

            <div id="constellation-grids">
                <h2 className="primary-text">Zodiacs</h2>
                <div id="constellation-grid">
                    <div className="constellation-card">
                        <img 
                            src={Aries} 
                            alt="Aries"
                        />
                        <h3 className="primary-text">Aries</h3>
                        <p className="secondary-text">The Ram</p>
                    </div>

                    <div className="constellation-card">
                        <img 
                            src={Taurus} 
                            alt="Taurus"
                        />
                        <h3 className="primary-text">Taurus</h3>
                        <p className="secondary-text">The Bull</p>
                    </div>

                    <div className="constellation-card">
                        <img 
                            src={Gemini} 
                            alt="Gemini"
                        />
                        <h3 className="primary-text">Gemini</h3>
                        <p className="secondary-text">The Twins</p>
                    </div>

                    <div className="constellation-card">
                        <img 
                            src={Cancer} 
                            alt="Cancer"
                        />
                        <h3 className="primary-text">Cancer</h3>
                        <p className="secondary-text">The Crab</p>
                    </div>

                    <div className="constellation-card">
                        <img 
                            src={Leo} 
                            alt="Leo"
                        />
                        <h3 className="primary-text">Leo</h3>
                        <p className="secondary-text">The Lion</p>
                    </div>

                    <div className="constellation-card">
                        <img 
                            src={Virgo} 
                            alt="Virgo"
                        />
                        <h3 className="primary-text">Virgo</h3>
                        <p className="secondary-text">The Maiden</p>
                    </div>

                    <div className="constellation-card">
                        <img 
                            src={Libra} 
                            alt="Libra"
                        />
                        <h3 className="primary-text">Libra</h3>
                        <p className="secondary-text">The Scales</p>
                    </div>

                    <div className="constellation-card">
                        <img 
                            src={Scorpius} 
                            alt="Scorpius"
                        />
                        <h3 className="primary-text">Scorpius</h3>
                        <p className="secondary-text">The Scorpion</p>
                    </div>

                    <div className="constellation-card">
                        <img 
                            src={Sagittarius} 
                            alt="Sagittarius"
                        />
                        <h3 className="primary-text">Sagittarius</h3>
                        <p className="secondary-text">The Archer</p>
                    </div>

                    <div className="constellation-card">
                        <img 
                            src={Capricornus} 
                            alt="Capricornus"
                        />
                        <h3 className="primary-text">Capricornus</h3>
                        <p className="secondary-text">The Goat</p>
                    </div>

                    <div className="constellation-card">
                        <img 
                            src={Aquarius} 
                            alt="Aquarius"
                        />
                        <h3 className="primary-text">Aquarius</h3>
                        <p className="secondary-text">The Water-Bearer</p>
                    </div>

                    <div className="constellation-card">
                        <img 
                            src={Pisces} 
                            alt="Pisces"
                        />
                        <h3 className="primary-text">Pisces</h3>
                        <p className="secondary-text">The Fish</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Gallery;