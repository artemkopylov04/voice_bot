const client = new require('elasticsearch').Client({
    host: 'localhost:9200',
    requestTimeout: 300000
});

const response = client.search({
        index: 'cities',
        body: {
            query: {
                match: {
                    city: {
                        query: "Kazane",
                        fuzziness: 2,
                        prefix_length: 1
                    }
                 }
            }
        }
    })
    .then((res) => console.log(res.hits.hits[0]));