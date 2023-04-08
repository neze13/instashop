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
      const user = await Parse.User.logIn(username, password);
      return {
        objectId: user.id,
        sessionToken: user.attributes.sessionToken,
      };
    } catch (err) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, {
        message: err.message,
      });
    }
  });
  
  async function fetchLandmarks() {
    const query = new Parse.Query('Landmark');
    const landmarks = await query
      .ascending('order')
      .select('title', 'short_info', 'photo_thumb', 'photo')
      .find();
    return landmarks.map(landmark => {
      return {
        title: landmark.attributes.title,
        short_info: landmark.attributes.short_info,
        photo_thumb: landmark.attributes.photo_thumb,
        photo: landmark.attributes.photo,
      };
    });
  }
  
  async function fetchLandmark(objectId) {
    const query = new Parse.Query('Landmark');
    query.equalTo('objectId', objectId);
    const landmark = await query.first();
    return landmark;
  }
  
  Parse.Cloud.define('fetchLandmarks', async req => {
    try {
      const landmarks = req.params.objectId
        ? await fetchLandmark(req.params.objectId)
        : await fetchLandmarks();
      return landmarks;
    } catch (err) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, {
          message: err.message,
        });
    }
  });
  
  Parse.Cloud.define('saveLandMark', async req => {
    try {
      const { objectId, dataToUpdate } = req.params;
      const query = new Parse.Query('Landmark');
      query.equalTo('objectId', objectId);
      const landmark = await query.first();
      if (!landmark) {
        throw new Error(`landmark with objectId: ${objectId} does not exist`);
      }
      for (const key in dataToUpdate) {
        landmark.set(key, dataToUpdate[key]);
      }
      const sessionToken = req.headers['x-parse-session-token'];
      const response = await landmark.save(null, {sessionToken });
      return response;
    } catch (err) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, {
          message: err.message,
        });
    }
  });
  