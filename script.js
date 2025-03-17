//---------------------------------- Lead form DOM elements
const leadEmail = document.getElementById('lead-email');
const leadFirstName = document.getElementById('lead-first-name');
const leadLastName = document.getElementById('lead-last-name');
const leadPhoneNumber = document.getElementById('lead-phone');
const leadCountry = document.getElementById('lead-country');
const leadProgram = document.getElementById('lead-program');
const leadStartYear = document.getElementById('lead-start-year');
const leadPrivacyPolicy = document.getElementById('lead-privacy');
const leadPrivacyLabel = document.getElementById('lead-privacy-label')
//LOGIC TO CHANGE BETWEEN PAGES
let currentCardIndex = 0;

//NAVIGATION BUTTONS
document.addEventListener('click', function (event) {
    if (event.target && event.target.tagName === 'BUTTON') {
        const nextQuestionId = event.target.dataset.next; // Next question ID
        showPage(nextQuestionId);
    }
});
//RADIO BUTTONS
document.addEventListener('change', function(event) {
    if(event.target && event.target.type === 'radio' && event.target.id !== 'calculate-button') {
        const nextQuestionId = event.target.dataset.next; // Next question ID
        showPage(nextQuestionId);
        event.target.checked = false; // Reset checked state if needed
    }
});



function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active')); // Hide all pages
    document.getElementById(`question-${pageId}`).classList.add('active'); // Show the selected page
}

//WORKING: Creating the dropdown list of countries
function countries_loader() {
    let countries_array = ["Albania", "Algeria", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bangladesh", "Barbados", "Belarus", "Belgium", "Benin", "Bermuda", "Bhutan", "Bolivia", "Brazil", "Brunei", "Bulgaria", "Cambodia", "Cameroon", "Canada", "Cayman Islands", "Chile", "China", "Colombia", "Costa Rica", "Croatia", "Cyprus", "Czech Republic", "Denmark", "East Timor", "Ecuador", "Egypt", "El Salvador", "Estonia", "Eswatini", "Ethiopia", "Finland", "France", "Georgia", "Germany", "Ghana", "Greece", "Guatemala", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iraq", "Ireland", "Israel", "Italy", "Japan", "Kazakhstan", "Kenya", "Kyrgyzstan", "Laos", "Lebanon", "Lesotho", "Libya", "Lithuania", "Luxembourg", "Macao", "Malaysia", "Malta", "Mauritania", "Mexico", "Mongolia", "Montenegro", "Morocco", "Myanmar", "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nigeria", "Norway", "Pakistan", "Palau", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia", "Serbia", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Suriname", "Sweden", "Switzerland", "Tajikistan", "Tanzania", "Thailand", "Tunisia", "Turkey", "Turks and Caicos Islands", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uzbekistan", "Vanuatu", "Vietnam", "Virgin Islands", "Zambia", "Zimbabwe"];

    countries_array.forEach(element => {
        // Create an <option> element
        const countryItem = document.createElement("option");
        countryItem.value = element; // Set the value attribute
        countryItem.textContent = element; // Set the visible text

        leadCountry.appendChild(countryItem);
    });
}
countries_loader();

//FINAL SCORE CALCULATOR

const answerMapping = {
    "strongly-agree": 0,
    "agree": 1,
    "neither": 2,
    "disagree": 3,
    "strongly-disagree": 4
};

// Global variable to store CSV scoring data.
let scoringDataGlobal = null;

// Load the CSV data when the page loads.
loadAndParseCSV().then(data => {
    scoringDataGlobal = data;
    console.log('Scoring data loaded:', scoringDataGlobal);
});

// Event listener for the submission button.
document.getElementById("calculate-button").addEventListener("click", function (e) {

    //Check if every required field is filled, return if not
    let valid = true; 

        if (!leadEmail.value || leadEmail.value === "") {
            //alert('Please enter a valid email.');
            leadEmail.style.border = "1px solid red";

            valid = false;
        }
        if (!leadFirstName.value || leadFirstName.value === "") {
            //alert('Please enter a valid email.');
            leadFirstName.style.border = "1px solid red";
            valid = false;
        }
        if (!leadLastName.value || leadLastName.value === "") {
            //alert('Please enter a valid email.');
            leadLastName.style.border = "1px solid red";
            valid = false;
        }
        if (leadCountry.value === "") {
            //alert('Please enter a valid email.');
            leadCountry.style.borderColor = "red";
            valid = false;
        }
        if (!leadProgram.value || leadProgram.value === "") {
            //alert('Please enter a valid email.');
            leadProgram.style.borderColor = "red";
            valid = false;
        }
        if (!leadStartYear.value || leadStartYear.value === "") {
            //alert('Please enter a valid email.');
            leadStartYear.style.borderColor = "red";
            valid = false;
        }

        if (!leadPrivacyPolicy.checked) {
            leadPrivacyLabel.style.color = "red";
            valid = false;
        }
        

    if (!valid) return    

    e.preventDefault(); // Prevent default form submission
    document.getElementById("question-18").classList.remove("active");
    document.getElementById("question-19").classList.add("active");

    // Assuming the total number of questions equals the number of blocks in the CSV.
    // For example, if your CSV contains questions 1 to 18, then numQuestions = 18.
    const numQuestions = Object.keys(scoringDataGlobal).length;
    const studentAnswers = collectStudentAnswers(numQuestions);
    const totals = calculateTotalScores(scoringDataGlobal, studentAnswers);
    const recommendedDegree = getRecommendedDegree(totals);

    // Display the result. You can update a DOM element with the recommendation.
    let resultElem = document.getElementById("result");
    if (!resultElem) {
        resultElem = document.createElement("div");
        resultElem.id = "result";
        document.body.appendChild(resultElem);
    }
    resultElem.textContent = "Based on your answers, the recommended degree is: " + recommendedDegree;
});


// Fetch the CSV file and parse its contents into an object.
function loadAndParseCSV() {
    return fetch('scoring.csv')
        .then(response => response.text())
        .then(csvText => {
            // Split text into lines and remove empty ones.
            const lines = csvText.split('\n').map(line => line.trim()).filter(line => line !== '');
            const data = {}; // This will map question IDs (e.g., "question-1") to their scoring tables.
            let i = 0;
            while (i < lines.length) {
                // Look for a header that starts with "question-"
                if (!lines[i].startsWith('question-')) {
                    i++;
                    continue;
                }
                // Split header line into cells.
                const headerCells = lines[i].split(',').map(cell => cell.trim());
                const questionId = headerCells[0];
                // The rest of the header cells are the degree names.
                const degrees = headerCells.slice(1);
                // Prepare an object to hold scores for this question.
                // For each degree, we will store an array of five numbers.
                const questionScores = {};
                degrees.forEach(degree => {
                    questionScores[degree] = [];
                });
                // The next five lines are the answer rows.
                for (let j = 1; j <= 5 && (i + j) < lines.length; j++) {
                    const rowCells = lines[i + j].split(',').map(cell => cell.trim());
                    // The first cell is the answer option (e.g., "Strongly agree")
                    // We ignore it here because we assume the order is fixed:
                    // index 0: Strongly agree, 1: Agree, 2: Neither, 3: Disagree, 4: Strongly disagree.
                    // For each degree, add the score (converted to number) to its array.
                    degrees.forEach((degree, idx) => {
                        // rowCells[idx+1] corresponds to the score for that degree.
                        questionScores[degree].push(Number(rowCells[idx + 1]));
                    });
                }
                // Store the parsed block in our data object.
                data[questionId] = questionScores;
                // Skip past this block (header + 5 rows)
                i += 6;
            }
            return data;
        })
        .catch(err => {
            console.error('Error loading CSV:', err);
        });
}

function collectStudentAnswers(numQuestions) {
    const answers = {};
    // For each question number (e.g., 1 to numQuestions)
    for (let q = 1; q <= numQuestions; q++) {
        // Get the form for question q (e.g., "question-1-form")
        const form = document.getElementById(`question-${q}-form`);
        if (!form) continue;
        // Look for the selected radio input.
        const selected = form.querySelector('input[type="radio"]:checked');
        // Save the answer value (or null if not answered)
        answers[`question-${q}`] = selected ? selected.value : null;
    }
    return answers;
}
function calculateTotalScores(scoringData, studentAnswers) {
    // Initialize an object to store total scores for each degree.
    // Assume that every question uses the same set of degree keys.
    const degreeNames = Object.keys(scoringData[Object.keys(scoringData)[0]]);
    const totalScores = {};
    degreeNames.forEach(degree => totalScores[degree] = 0);

    // Process each question.
    for (const questionId in studentAnswers) {
        const answerValue = studentAnswers[questionId];
        // Skip if not answered.
        if (!answerValue) continue;
        // Map the answer value to an index.
        const answerIndex = answerMapping[answerValue];
        // Get the score table for this question.
        const questionTable = scoringData[questionId];
        if (!questionTable) continue;
        // For each degree, add the score corresponding to the student's answer.
        degreeNames.forEach(degree => {
            totalScores[degree] += questionTable[degree][answerIndex];
        });
    }
    return totalScores;
}

function getRecommendedDegree(totalScores) {
    let recommended = null;
    let maxScore = -Infinity;

    for (let degree in totalScores) {
        if (totalScores[degree] > maxScore) {
            maxScore = totalScores[degree];
            recommended = degree;
        }
    }
    console.log(recommended);

    return recommended;
}
