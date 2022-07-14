import { useParams } from "react-router-dom";

import IPCExplorer from './IPCExplorer';
import Wallet from './Wallet';

export default function RouteLayout(props) {

  const { value } = useParams();

  if (typeof value == 'string' && value.match(/^0x/))
    return (<Wallet walletAddress={value} />);
  else 
    return (<IPCExplorer tokenId={value} />);

}

