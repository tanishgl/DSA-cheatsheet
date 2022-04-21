const http = require('http');
const fs = require('fs');
const url = require('url');

const PORT = 8000;

function replaceTemplate(template, entity, type){
  let output = template.replace(/{%ENTITY_NAME%}/ , entity.name);
  output = output.replace(/{%TYPE%}/g, type);
  if(type === 'topic'){
    output = output.replace(/{%GO_HERE%}/g, `subtopic/${entity.name}`);
  } else if (type === 'subtopic'){
    output = output.replace(/{%GO_HERE%}/g, `${entity.myurl}`)
  } else if (type === 'question'){
    output = output.replace(/{%GO_HERE%}/g, entity.link);
  }
  return output;
}

//Reading the files synchronously on server starting.
const topicTemp = fs.readFileSync(`${__dirname}/Templates/templateCard.html`, 'utf-8');
const dsaTemp = fs.readFileSync(`${__dirname}/Templates/topicCard.html`, 'utf-8');
const data = fs.readFileSync(`${__dirname}/Resources/data.json`, 'utf-8');
const dataObject = JSON.parse(data);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);
  const parts = pathname.split("/");
  console.log(parts);

  if(pathname === '/' || pathname === '/dsa'){
    res.writeHead(200, {
      'content-type' : 'text/html',
    });

    const topicList = dataObject.map(el => replaceTemplate(topicTemp, el, "topic")).join('');
    const renderedHTML = dsaTemp.replace(/{%TEMPLATE_CARD%}/g, topicList);
    res.end(renderedHTML);

  } else if (parts.length === 3) {
    res.writeHead(200, {
      'content-type' : 'text/html',
    });

    const topic = parts[2].split('%20').join(' ');
    let idx = dataObject.findIndex(el => el.name === topic);
    //Save the current url here.
    dataObject[idx].subtopics.map(el => {
      el['myurl'] = `${pathname}/${el.name}`;
    });
    const subtopicList = dataObject[idx].subtopics.map(el => replaceTemplate(topicTemp, el, "subtopic")).join('');
    const renderedHTML = dsaTemp.replace(/{%TEMPLATE_CARD%}/g, subtopicList);
    res.end(renderedHTML);

  } else if (parts.length === 4){
    res.writeHead(200, {
      'content-type' : 'text/html',
    });
    
    const topic = parts[2].split("%20").join(' ');
    const subtopic = parts[3].split("%20").join(' ');
    console.log(subtopic);

    let topicObj = dataObject.find(el => el.name === topic)
    let idx = topicObj.subtopics.findIndex(el => el.name === subtopic);
    let questions = topicObj.subtopics[idx].questions.map(el => replaceTemplate(topicTemp, el, "question")).join('');
    let renderedHTML = dsaTemp.replace(/{%TEMPLATE_CARD%}/g, questions);
    res.end(renderedHTML);

  } else if (url === '/favicon.ico') { 
    r.writeHead(200, {'Content-Type': 'image/x-icon'} ); 
    r.end();
    return; 
  } else {
    res.writeHead(400, {
      'content-type' : 'text/html',
    });

    res.end('<h1> BAD REQUEST </h1>');
  }
});

server.listen(PORT, 'localhost');