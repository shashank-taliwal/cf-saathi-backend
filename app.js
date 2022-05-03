const express = require('express');
const axios = require('axios');
const { response } = require('express');
const app = express();
const port = process.env.PORT || 3001;

function findIndexInArray(finalResp, problemObj) {
    for (let i = 0; i < finalResp.length; i++) {
        if (finalResp[i].problem === problemObj.problem) {
            return i;
        }
    }
    return -1;
}
app.get('/', (req, res) => {
    // res.send("Welcome to CF Saathi");
    console.log("========================================");
    console.log("Welcome to CF Saathi");
    console.log("========================================");
});


app.get(`/getProblems/:user`, (req, res) => {
    const cfHandle = req.params.user;
    const count = req.query.count;
    const submissionType = req.query.submissionType;
    axios
        .get(`https://codeforces.com/api/user.status?handle=${cfHandle}`)
        .then(response => {
            const cfResp = response.data.result;
            //The cfResp contains the details about the user submissions

            let problemsResp = [];

            for (let i = 0; i < cfResp.length; i++) {
                let probObj = {
                    "contest": cfResp[i].problem.contestId,
                    "index": cfResp[i].problem.index,
                    "problem": cfResp[i].problem.contestId + cfResp[i].problem.index,
                    "name": cfResp[i].problem.name,
                    "rating": cfResp[i].problem.rating || "NOT AVAILABLE",
                    "tags": cfResp[i].problem.tags,
                    "participationType": cfResp[i].author.participantType,
                    "programmingLanguage": cfResp[i].programmingLanguage,
                    "verdict": cfResp[i].verdict
                }
                problemsResp.push(probObj);
            }
            let finalResp = [];
            for (let i = 0; i < problemsResp.length; i++) {
                let idx = findIndexInArray(finalResp, problemsResp[i])
                if (idx === -1) {
                    let finalRespObj = {
                        "contest": problemsResp[i].contest,
                        "index": problemsResp[i].index,
                        "problem": problemsResp[i].problem,
                        "name": problemsResp[i].name,
                        "rating": problemsResp[i].rating,
                        "tags": problemsResp[i].tags,
                        "participationType": problemsResp[i].participantType,
                        "programmingLanguage": problemsResp[i].programmingLanguage,
                        "verdict": {
                            "AC": problemsResp[i].verdict === "OK" ? 1 : 0,
                            "WA": problemsResp[i].verdict === "WRONG_ANSWER" ? 1 : 0,
                            "TLE": problemsResp[i].verdict === "TIME_LIMIT_EXCEEDED" ? 1 : 0,
                            "MLE": problemsResp[i].verdict === "MEMORY_LIMIT_EXCEEDED" ? 1 : 0,
                            "RE": problemsResp[i].verdict === "RUNTIME_ERROR" ? 1 : 0,
                            "CE": problemsResp[i].verdict === "COMPILATION_ERROR" ? 1 : 0,
                        }
                    }
                    finalResp.push(finalRespObj);
                }
                else {
                    let indexOfProblem = idx;
                    console.log(indexOfProblem);
                    if (problemsResp[i].verdict === "WRONG_ANSWER") {
                        finalResp[indexOfProblem].verdict.WA += 1;
                    }
                    else if (problemsResp[i].verdict === "OK") {
                        finalResp[indexOfProblem].verdict.AC += 1;
                    }
                    else if (problemsResp[i].verdict === "TIME_LIMIT_EXCEEDED") {
                        finalResp[indexOfProblem].verdict.TLE += 1;
                    }
                    else if (problemsResp[i].verdict === "MEMORY_LIMIT_EXCEEDED") {
                        finalResp[indexOfProblem].verdict.MLE += 1;
                    }
                    else if (problemsResp[i].verdict === "RUNTIME_ERROR") {
                        finalResp[indexOfProblem].verdict.RE += 1;
                    }
                    else if (problemsResp[i].verdict === "COMPILATION_ERROR") {
                        finalResp[indexOfProblem].verdict.CE += 1;
                    }
                }
            }
            res.json({ statusCode: '200', data: finalResp });
        })
        .catch(error => {
            console.log(error);
            res.json({ status: 'failed', data: error });
        })
});

app.get('/getRating/:user', (req, res) => {
    let cfHandle = req.params.user;
    axios.get(`https://codeforces.com/api/user.rating?handle=${cfHandle}`)
        .then(response => {
            const cfRatingResp = response.data.result;
            let finalResp = [];
            for (let i = 0; i < cfRatingResp.length; i++) {
                let cfRatingObj = {
                    "ContestID": cfRatingResp[i].contestId,
                    "ContestName": cfRatingResp[i].contestName,
                    "Rank": cfRatingResp[i].rank,
                    "Old_Rating": cfRatingResp[i].oldRating,
                    "New_Rating": cfRatingResp[i].newRating
                }
                finalResp.push(cfRatingObj);
            }
            res.json({ statusCode: '200', data: finalResp });
        })
        .catch(error => {
            res.json({ status: 'failed', data: error });
        });
});

app.get('/getUserInfo/:user', (req, res) => {
    let cfHandle = req.params.user;
    axios.get(`https://codeforces.com/api/user.info?handles=${cfHandle}`)
        .then(response => {
            const cfUserInfo = response.data.result;
            res.json({ statusCode: '200', data: cfUserInfo });
        })
        .catch(error =>
            res.json({ status: 'failed', data: error }));
});
app.listen(port, () => {
    console.log(`Server up and running at port ${port}`);
    console.log("========================================");
    console.log("Welcome to CF Saathi");
    console.log("========================================");
})