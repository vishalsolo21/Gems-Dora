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

    // 🔥 NEW: extract product JSON blocks (more reliable)
    const matches = [...html.matchAll(/"product_name":"(.*?)".*?"final_price":(.*?),.*?"price":(.*?),.*?"image":"(.*?)".*?"url":"(.*?)"/g)];

    let deals = matches.map(m => {
      const name = m[1];
      const price = parseFloat(m[2]);
      const mrp = parseFloat(m[3]);
      const image = "https://www.jiomart.com/images/product/" + m[4];
      const link = "https://www.jiomart.com" + m[5];

      const discount = Math.round(((mrp - price) / mrp) * 100);

      return { name, price, mrp, discount, image, link };
    }).filter(p => p.discount >= 60);

    res.status(200).json({
      deals,
      nextPage: parseInt(page) + 1
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch deals" });
  }
}
