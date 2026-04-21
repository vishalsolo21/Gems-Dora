export default async function handler(req, res) {
  const { page = 1 } = req.query;

  try {
    const url = `https://www.jiomart.com/search?q=%20&searchtype=quick&sort=discount&page=${page}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html",
        "Referer": "https://www.jiomart.com/"
      }
    });

    const html = await response.text();

    // Extract JSON data from page
    const match = html.match(/window.__PRELOADED_STATE__ = (.*?);<\/script>/);

    if (!match) {
      return res.status(500).json({ error: "No data found" });
    }

    const data = JSON.parse(match[1]);

    const products = data?.search?.products || [];

    const deals = products
      .map(p => {
        const discount = Math.round(((p.mrp - p.price) / p.mrp) * 100);

        return {
          name: p.name,
          price: p.price,
          mrp: p.mrp,
          discount,
          image: p.image,
          link: `https://www.jiomart.com/p/${p.slug}`
        };
      })
      .filter(p => p.discount >= 60);

    res.status(200).json({
      deals,
      nextPage: parseInt(page) + 1
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch deals" });
  }
}
