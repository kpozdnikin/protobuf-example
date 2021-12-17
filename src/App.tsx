import React, { useCallback, useEffect, useState } from 'react';
import type { ProtobufAttributeType } from './protobufUtils';
import { deserializeNft } from './protobufUtils';
import './App.css';
import babiesCollectionInfo from './babiesCollectionInfo.json';
import punksCollectionInfo from './punksCollectionInfo.json';
import chelobricCollectionInfo from './chelobricCollectionInfo.json';

export type SchemaVersionTypes = 'ImageURL' | 'Unique';

export type AttributesDecoded = {
  [key: string]: string | string[],
}

export interface NftCollectionInterface {
  access?: 'Normal' | 'WhiteList'
  id: string;
  decimalPoints: number;
  description: number[];
  tokenPrefix: string;
  mintMode?: boolean;
  mode: {
    nft: null;
    fungible: null;
    reFungible: null;
    invalid: null;
  };
  name: number[];
  offchainSchema: string;
  owner?: string;
  schemaVersion: SchemaVersionTypes;
  sponsorship: {
    confirmed?: string;
    disabled?: string | null;
    unconfirmed?: string | null;
  };
  limits?: {
    accountTokenOwnershipLimit: string;
    sponsoredDataSize: string;
    sponsoredDataRateLimit: string;
    sponsoredMintSize: string;
    tokenLimit: string;
    sponsorTimeout: string;
    ownerCanTransfer: boolean;
    ownerCanDestroy: boolean;
  },
  variableOnChainSchema: string;
  constOnChainSchema: string;
}

export type IpfsJsonType = { ipfs: string, type: 'image' };

function App() {
  const [chelobric, setChelobric] = useState<AttributesDecoded>();
  const [substratpunk, setSubstratpunk] = useState<AttributesDecoded>();
  const [uniqueBaby, setUniqueBaby] = useState<AttributesDecoded>();

  const tokenImageUrl = useCallback((attributes): string => {
    let tokenImageUrl: string;
    let ipfsJson: IpfsJsonType;

    try {
      ipfsJson = JSON.parse(attributes.ipfsJson as string) as IpfsJsonType;
      tokenImageUrl = `https://dev-ipfs.unique.network/ipfs/${ipfsJson?.ipfs}`;
    } catch (e) {
      console.log('ipfsJson parse error', e);

      return '';
    }

    return tokenImageUrl;
  }, []);

  const hex2a = useCallback((hexx: string) => {
    const hex: string = hexx.substring(2);
    let str = '';

    for (let i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }

    return str;
  }, []);

  const decodeStruct = useCallback(({ attr, data }: { attr?: any, data?: string }): AttributesDecoded => {
    if (attr && data) {
      try {
        const schema = JSON.parse(attr) as ProtobufAttributeType;

        if (schema?.nested) {
          return deserializeNft(schema, Buffer.from(data.slice(2), 'hex'), 'en');
        }
      } catch (e) {
        console.log('decodeStruct error', e);
      }
    }

    return {};
  }, []);

  const getTokenAttributes = useCallback(async (constOnChainSchema: string, constData: string): Promise<AttributesDecoded> => {
    return {
      ...decodeStruct({ attr: constOnChainSchema, data: constData }),
    };
  }, [decodeStruct]);

  const fillAttributes = useCallback(async () => {
    /*if (constSchema) {
      const attributes: AttributeItemType[] = fillAttributes(constSchema);
    }*/
    const chel = await getTokenAttributes(hex2a(chelobricCollectionInfo.constOnChainSchema), chelobricCollectionInfo.constData);
    const punk = await getTokenAttributes(hex2a(punksCollectionInfo.constOnChainSchema), punksCollectionInfo.constData);
    const baby = await getTokenAttributes(hex2a(babiesCollectionInfo.constOnChainSchema), babiesCollectionInfo.constData);

    setChelobric(chel);
    setSubstratpunk(punk);
    setUniqueBaby(baby);
  }, []);

  useEffect(() => {
    void fillAttributes();
  }, []);

  return (
    <div className="App">
      <h1>Protobuf examples</h1>
      <div className='block'>
        <div className='left'>
          <h2>SubstratPunk</h2>
        </div>
        <div className='right'>
          <p>
            constData.length: <strong>{chelobricCollectionInfo.constData.length} </strong>
            constData.JSON.length: <strong>{substratpunk ? JSON.stringify(substratpunk).length : 0} </strong>
          </p>
          Attributes:
          {substratpunk && Object.keys(substratpunk).map((attrKey) => {
            if (attrKey === 'ipfsJson') {
              return null;
            }

            if (!Array.isArray(substratpunk[attrKey])) {
              return <p key={attrKey}>{attrKey}: {substratpunk[attrKey]}</p>;
            }

            return (
              <p key={attrKey}>{attrKey}: {(substratpunk[attrKey] as string[]).join(', ')}</p>
            );
          })}
        </div>
      </div>
      <div className='block'>
        <div className='left'>
          <h2>Chelobric</h2>
        </div>
        <div className='right'>
          <p>
            constData.length: <strong>{punksCollectionInfo.constData.length} </strong>
            constData.JSON.length: <strong>{chelobric ? JSON.stringify(chelobric).length : 0} </strong>
          </p>
          <p>constData.JSON: <strong>{chelobric ? JSON.stringify(chelobric) : ''} </strong></p>
          Attributes:
          {chelobric && Object.keys(chelobric).map((attrKey) => {
            if (attrKey === 'ipfsJson') {
              return null;
            }

            if (!Array.isArray(chelobric[attrKey])) {
              return <p key={attrKey}>{attrKey}: {chelobric[attrKey]}</p>;
            }

            return (
              <p key={attrKey}>{attrKey}: {(chelobric[attrKey] as string[]).join(', ')}</p>
            );
          })}
        </div>
      </div>
      <div className='block'>
        <div className='left'>
          <h2>UniqueBaby</h2>
        </div>
        <div className='right'>
          <p>
            constData.length: <strong>{babiesCollectionInfo.constData.length} </strong>
            constData.JSON.length: <strong>{uniqueBaby ? JSON.stringify(uniqueBaby).length : 0} </strong>
          </p>
          <p>constData.JSON: <strong>{uniqueBaby ? JSON.stringify(uniqueBaby) : ''} </strong></p>
          <p>constData.JSON: <strong>{uniqueBaby ? hex2a(babiesCollectionInfo.constOnChainSchema) : ''} </strong></p>
          Attributes:
          {uniqueBaby && Object.keys(uniqueBaby).map((attrKey) => {
            if (attrKey === 'ipfsJson') {
              return null;
            }

            if (!Array.isArray(uniqueBaby[attrKey])) {
              return <p key={attrKey}>{attrKey}: {uniqueBaby[attrKey]}</p>;
            }

            return (
              <p key={attrKey}>{attrKey}: {(uniqueBaby[attrKey] as string[]).join(', ')}</p>
            );
          })}
          <img
            alt=''
            src={tokenImageUrl(uniqueBaby)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
