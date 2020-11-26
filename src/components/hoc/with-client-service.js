import React from 'react';
import {ClientServiceConsumer} from '../client-service-context';

const withClientService = () => (Wrapper) => {
    return (props) => {
        return (
            <ClientServiceConsumer>
                {
                    (clientService) => {
                        return (<Wrapper {...props} clientService={clientService}/>);
                    }
                }
            </ClientServiceConsumer>
        );
    }
};

export default withClientService;