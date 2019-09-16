import Realm from "realm";
import moment from "moment";
import {
  userSchema,
  contactSchema,
  chatSquema,
  BroadCasContacts,
  messageSquema
} from "./schemas";

const databaseOptions = {
  schema: [
    userSchema,
    contactSchema,
    chatSquema,
    messageSquema,
    BroadCasContacts
  ],
  schemaVersion: 11
};

const getRealm = () =>
  new Promise(resolve => {
    resolve(Realm.open(databaseOptions));
  });

export const writteUser = obj =>
  new Promise(async (resolve, reject) => {
    Realm.open(databaseOptions).then(realm => {
      try {
        realm.write(() => {
          realm.create(
            "user",
            {
              uid: obj.uid,
              name: obj.name,
              picture: obj.picture,
              chats: obj.chats
            },
            true
          );
        });
        resolve(obj);
      } catch (e) {
        reject(e);
      }
    });
  });

export const addContacts = (uid, obj) =>
  new Promise(async (resolve, reject) => {
    Realm.open(databaseOptions).then(realm => {
      realm.write(() => {
        let user = realm.objectForPrimaryKey("user", uid);
        user.contacts.push({
          uid: obj[0].uid,
          name: obj[0].name,
          picture: obj[0].picture,
          hashUID: obj[0].hashUID
        });
        resolve(obj);
      });
    });
  });

export const getUserData = () =>
  new Promise(async resolve => {
    Realm.open(databaseOptions).then(realm => {
      const user = realm.objects("user");

      resolve(user);
    });
  });

export const setMessage = (id, obj) =>
  new Promise(async (resolve, reject) => {
    Realm.open(databaseOptions).then(realm => {
      realm.write(() => {
        let chat = realm.objectForPrimaryKey("Chat", id);
        chat.messages.push({ ...obj, id: obj.msgID, msg: obj.msg.text });
        resolve();
      });
    });
  });

export const addTemporalInfo = obj =>
  new Promise(resolve => {
    Realm.open(databaseOptions).then(realm => {
      realm.write(() => {
        console.log("object", obj);
        realm.create("temporalContacts", {
          ...obj
        });
        resolve(obj);
      });
    });
  });

export const verifyContact = hashUID =>
  new Promise(resolve => {
    Realm.open(databaseOptions).then(realm => {
      const contact = realm.objects("Contact").find(data => {
        return data.hashUID === hashUID;
      });
      resolve(contact);
    });
  });

export const getTemporalContact = id =>
  new Promise(resolve => {
    Realm.open(databaseOptions).then(realm => {
      temporal = realm.objectForPrimaryKey("temporalContacts", id);
      if (temporal) {
        resolve(JSON.parse(JSON.stringify(temporal)));
      } else {
        resolve(undefined);
      }
    });
  });

export const getMessageByTime = () =>
  new Promise(resolve => {
    const currentTime = moment();
    Realm.open(databaseOptions).then(realm => {
      realm.write(() => {
        const data = realm.objects("Message").filtered("toUID == null");
        if (data.length > 500) {
          result = data.slice(0, 500);
          realm.delete(result);
        }

        const result = data.filter(data => {
          const timeCreated = moment(data.timestamp);
          return currentTime.diff(timeCreated, "h") > 48;
        });

        realm.delete(result);
        resolve();
      });
    });
  });