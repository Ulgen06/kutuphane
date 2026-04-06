const BASE_URL = 'https://gutendex.com';

export const searchBooks = async (query, language = '') => {
  try {
    let url = `${BASE_URL}/books?search=${encodeURIComponent(query)}`;
    if (language && language !== 'all') {
      url += `&languages=${language}`;
    }
    
    const res = await fetch(url);
    const data = await res.json();
    return data.results
      .filter(book => book.formats['image/jpeg']) // Keep only books with covers
      .map(book => {
        const pdfFormat = book.formats['application/pdf'];
        const htmlFormat = book.formats['text/html'] || book.formats['text/html; charset=utf-8'];
        const fallbackPdf = 'https://pdfobject.com/pdf/sample.pdf';
        
        return {
          id: book.id.toString(),
          title: book.title,
          author: book.authors?.[0]?.name || 'Unknown Author',
          cover: book.formats['image/jpeg'],
          downloadUrl: htmlFormat || pdfFormat || fallbackPdf, 
          language: book.languages?.[0]?.toUpperCase() || 'EN',
        };
      });
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
};
