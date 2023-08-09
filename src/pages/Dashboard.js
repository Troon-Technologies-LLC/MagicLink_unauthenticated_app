import { useEffect, useState } from "react";
import { magic } from "../lib/magic";
import { useNavigate } from "react-router-dom";
import * as fcl from "@onflow/fcl";

const Dashboard = () => {
  const [user, setUser] = useState();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [publicAddress, setPublicAddress] = useState("");
  const [trxId, setTrxId] = useState("");

  const AUTHORIZATION_FUNCTION = magic.flow.authorization;

  const navigate = useNavigate();

  const finishSocialLogin = async () => {
    try {
      const result = await magic.user.getMetadata();
      setEmail(result.email);
      setPublicAddress(result.publicAddress);
      setUser(result);
      console.log("result : ", result);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    finishSocialLogin();
    verify();
  }, []);

  const verify = async () => {
    try {
      console.log("SENDING TRANSACTION");
      var response = await fcl.send([
        fcl.transaction`
        import FlowToken from 0x7e60df042a9c0868
        import FungibleToken from 0x9a0766d93b6608b7
      
        transaction(){
          prepare(signer: AuthAccount){
            let sender = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
              ?? panic("Could not borrow Provider reference to the Vault")
    
            let receiverAccount = getAccount(0xe8a04c3424e13083)
    
            let receiver = receiverAccount.getCapability(/public/flowTokenReceiver)
              .borrow<&FlowToken.Vault{FungibleToken.Receiver}>()
              ?? panic("Could not borrow Receiver reference to the Vault")
    
            let tempVault <- sender.withdraw(amount: 100.0)
            receiver.deposit(from: <- tempVault)
          }
        }
      `,
        fcl.proposer(AUTHORIZATION_FUNCTION),
        fcl.authorizations([AUTHORIZATION_FUNCTION]),
        fcl.payer(AUTHORIZATION_FUNCTION),
        fcl.limit(9999),
      ]);
      console.log("TRANSACTION SENT");
      console.log("TRANSACTION RESPONSE", response);

      console.log("WAITING FOR TRANSACTION TO BE SEALED");
      var data = await fcl.tx(response).onceSealed();
      console.log("TRANSACTION SEALED", data);
      setTrxId(response.transactionId);
    } catch (error) {
      console.error("FAILED TRANSACTION", error);
    }
  };

  return (
    <div className="container">
      {!user && <div className="loading">Loading...</div>}

      {user && (
        // <div>
        //   <h1>Data returned:</h1>
        //   <pre className="user-info">{JSON.stringify(user, null, 3)}</pre>
        // </div>
        <>
          <div className="container">
            <h1>Current user: {userName}</h1>
            <h1>User Email: {email}</h1>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
