import React from 'react';

const Rank = ({name,entries}) => {
    return (
        <div>
            {`${name} , your current raink is...`}
            <div className='white f1'>
                {entries}
            </div>
            <div className='white f1'>
                {'007'}
            </div>
        </div>
    );
}

export default Rank;