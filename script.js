const SPREADSHEET_ID = '1TgjxVUu9Bci2ivFxk1hHPGVNVfUsxztXD4QoZEXsYUc';

async function analyzeSheet() {
    const question = document.getElementById('question').value;
    const outputDiv = document.getElementById('output');

    try {
        const sheetData = await mcp.readSheet(SPREADSHEET_ID);

        if (!sheetData || sheetData.length === 0) {
            outputDiv.innerText = 'No data found in the Google Sheet.';
            return;
        }

        // Format sheet data for LLM input (simple concatenation for now)
        const dataString = sheetData.map(row => row.join(',')).join('\\n');
        const prompt = `Question: ${question}\\nSheet Data:\\n${dataString}`;

        // Call LLM
        const llmResponse = await llm.chat(prompt);

        // Display LLM output
        outputDiv.innerText = llmResponse;

    } catch (error) {
        console.error(error);
        outputDiv.innerText = `An error occurred: ${error.message}`;
    }
}