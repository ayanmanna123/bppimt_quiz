import React from "react";
import "./CubeLoader.scss";

const CubeLoader = () => {
    return (
        <div className="cube-loader-container">
            <div className="container">
                <div className="h1Container">
                    {[1, 2, 3].map((w) =>
                        [1, 2, 3].map((l) => (
                            <div key={`h1-w${w}-l${l}`} className={`cube h1 w${w} l${l}`}>
                                <div className="face top"></div>
                                <div className="face left"></div>
                                <div className="face right"></div>
                            </div>
                        ))
                    )}
                </div>

                <div className="h2Container">
                    {[1, 2, 3].map((w) =>
                        [1, 2, 3].map((l) => (
                            <div key={`h2-w${w}-l${l}`} className={`cube h2 w${w} l${l}`}>
                                <div className="face top"></div>
                                <div className="face left"></div>
                                <div className="face right"></div>
                            </div>
                        ))
                    )}
                </div>

                <div className="h3Container">
                    {[1, 2, 3].map((w) =>
                        [1, 2, 3].map((l) => (
                            <div key={`h3-w${w}-l${l}`} className={`cube h3 w${w} l${l}`}>
                                <div className="face top"></div>
                                <div className="face left"></div>
                                <div className="face right"></div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CubeLoader;
