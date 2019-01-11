const client = new require('elasticsearch').Client({
    host: 'localhost:9200',
    requestTimeout: 300000
});


async function updateData(body, id) {
    await client.update({
        index: 'cities',
        type: 'names',
        id: id,
        body: {
            doc: {
                data: body
            }
        }
    });
}

async function getCity(text) {

    const transliterationWord = await client.indices.analyze({
            index: 'cities',
            body: {
                analyzer: "latin",
                text: text
            }
        });


    let token;

    if (transliterationWord.tokens[0].token !== undefined) {

        token = transliterationWord.tokens[0].token;

        const response = await client.search({
            index: 'cities',
            body: {
                query: {
                    match: {
                        city: {
                            query: token,
                            fuzziness: 2
                        }
                    }
                }
            }
        });

        if (response.hits.hits.length !== 0) {

            let id = response.hits.hits[0]._id;
            let data = response.hits.hits[0]._source.data;

            // if (data !== undefined && (date + 1800) < +Date.now()) {
            //     await client.update({
            //         index: 'cities',
            //         type: 'names',
            //         id: id,
            //         body: {
            //             doc: {
            //                 created: +Date.now()
            //             }
            //         }
            //     });
            //
            //     return {
            //         "code" : 404,
            //         "id" : response.hits.hits[0]._id}
            // }

            if (data !== undefined && (data.dt + 1800) < +Date.now()) {
                return data
            } else {
                return {
                    "id" : response.hits.hits[0]._id,
                    "code" : 404
                }
            }
        }

    }

}

module.exports = {getCity, updateData};