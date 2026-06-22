import React from 'react'
import Lottie from 'lottie-react';
import animation from "../animation/Loadingbar.json"

const Loder = () => {
    return (
        <div className="dashboard-loadingdash">
            <Lottie
                animationData={animation}
                loop={true}
                className="loading-animation"
            />
        </div>
    )
}

export default Loder;
