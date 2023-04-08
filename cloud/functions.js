Parse.Cloud.define('hello', req => {
  req.log.info(req);
  return 'Hi';
});

Parse.Cloud.define('asyncFunction', async req => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  req.log.info(req);
  return 'Hi async';
});

Parse.Cloud.beforeSave('Test', () => {
  throw new Parse.Error(9001, 'Saving test objects is not available.');
});

Parse.Cloud.define('login', async req => {
  try {
    const { username, password } = req.params;
    // throw error if username or password is not provided
    if (!username || !password) {
      throw new Error('username or password is not provided');
    }
    // login user
    const user = await Parse.User.logIn(username, password);
    //return the "objectId" of the user and the "sessionToken" that authenticates the user
    return {
      objectId: user.id,
      sessionToken: user.getSessionToken(),
    };
  } catch (err) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, err.message);
  }
});

async function fetchLandmarks() {
  // fetch all the documents, sorted in ascending order on the `order` field which exists on each document
  // select only 'title', 'short_info', 'photo_thumb', 'photo' from each document
  const query = new Parse.Query('Landmark');
  const landmarks = await query
    .ascending('order')
    .select('title', 'short_info', 'photo_thumb', 'photo')
    .find();

  // throw error if No landmarks are found
  if (!landmarks?.length) {
    throw new Error('No landmarks are found');
  }

  // since above landmarks contain createdAt, updatedAt, objectId , __type and className,
  // we need to keep only 'title', 'short_info', 'photo_thumb', 'photo'
  return landmarks.map(landmark => {
    return {
      title: landmark?.attributes?.title,
      short_info: landmark?.attributes?.short_info,
      photo_thumb: landmark?.attributes?.photo_thumb,
      photo: landmark?.attributes?.photo,
    };
  });
}

async function fetchLandmark(objectId) {
  // fetch landmark for given objectId
  const query = new Parse.Query('Landmark');
  query.equalTo('objectId', objectId);
  const landmark = await query.first();

  // throw error if No landmark is found
  if (!landmark) {
    throw new Error(`landmark with objectId: ${objectId} does not exist`);
  }

  return landmark;
}

Parse.Cloud.define('fetchLandmarks', async req => {
  try {
    // return only one landmark if there exists a parameter with the objectId of a landmarks' document in the request
    // when there is no "objectId" in the request parameters, the function should return all the documents with only the following fields: "title", "short_info", "photo_thumb", "photo"
    const landmarks = req.params.objectId
      ? await fetchLandmark(req.params.objectId)
      : await fetchLandmarks();
    return landmarks;
  } catch (err) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, err.message);
  }
});

Parse.Cloud.define('saveLandMark', async req => {
  try {
    // get sessionToken from request headers
    const sessionToken = req.headers['x-parse-session-token'];
    if(!sessionToken) {
        throw new Error(`x-parse-session-token is not provided inside request headers`);
    }

    const { objectId, dataToUpdate } = req.params;
    // throw error if objectId or dataToUpdate are not provided
    if (!objectId || !dataToUpdate) {
      throw new Error('objectId or dataToUpdate is not provided');
    }
    // fetch landmark for given objectId
    const query = new Parse.Query('Landmark');
    query.equalTo('objectId', objectId);
    const landmark = await query.first();
    // throw error if landmark for given objectId does not exist
    if (!landmark) {
      throw new Error(`landmark with objectId: ${objectId} does not exist`);
    }
    // construct updated landmark
    for (const key in dataToUpdate) {
      landmark.set(key, dataToUpdate[key]);
    }
    // save updated landmark
    const response = await landmark.save(null, { sessionToken });
    return response;
  } catch (err) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, err.message);
  }
});
