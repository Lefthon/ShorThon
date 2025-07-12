import { connectToDB } from '../../lib/database';
import { ShortLink } from '../../lib/models';

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === 'POST') {
    // Handle shorten
    try {
      const { url } = req.body;
      const shortCode = require('crypto').randomBytes(4).toString('hex');
      
      const shortLink = new ShortLink({
        originalUrl: url,
        shortCode
      });
      
      await shortLink.save();
      
      res.json({
        shortUrl: `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}/l/${shortCode}`,
        originalUrl: url
      });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  } else {
    // Handle redirect
    try {
      const { code } = req.query;
      const shortLink = await ShortLink.findOne({ shortCode: code });
      
      if (!shortLink) {
        return res.status(404).send('Link not found');
      }
      
      shortLink.clicks++;
      await shortLink.save();
      
      res.redirect(shortLink.originalUrl);
    } catch (err) {
      res.status(500).send('Server error');
    }
  }
}
