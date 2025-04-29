import React, { useEffect, useState } from "react";
import * as cheerio from "cheerio";

const HTMLMetadataDisplay = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchHTML = async () => {
      try {
        // Fetch the HTML file
        const response = await fetch("/external.html");
        const htmlText = await response.text();

        // Parse the HTML using Cheerio
        const $ = cheerio.load(htmlText);

        // Select rows from the table
        const tableRows = [];
        $("table tr").each((i, row) => {
          const cells = $(row)
            .find("td, th")
            .map((j, cell) => $(cell).text().trim())
            .get();
          if (cells.length > 0) {
            tableRows.push(cells);
          }
        });

        setRows(tableRows);
      } catch (error) {
        console.error("Error fetching or parsing HTML:", error);
      }
    };

    fetchHTML();
  }, []);

  return (
    <div className="p-0 overflow-x-auto max-w-full table-container" style={{ maxHeight: "40vh", overflowY: "auto" }}>
      {rows.length > 0 ? (
        <table border="1" className="table min-w-max w-full border border-green-200 custom-table">
          <thead className="sticky top-0 bg-green-50 z-10">
            <tr>
              {rows[0].map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(1).map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default HTMLMetadataDisplay;
