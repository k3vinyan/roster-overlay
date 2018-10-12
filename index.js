import $ from 'jquery';
import io from 'socket.io-client';

$( document ).ready(function(){

  const socket = io('http://amazon-yard.herokuapp.com');
  const getDataButton = document.createElement('button');
  getDataButton.innerText = 'Create Roster';
  getDataButton.id = 'getDataButton';
  getDataButton.type = 'button';
  getDataButton.classList.add("btn", "btn-outline-primary")

  $('#rosterViewTitle').after(getDataButton);

  $('#getDataButton').click(function(){
    $('.fp-navigation-container').css('height', '10px');
    getData();
    $('#pageRosterViewContent').hide();
    $('#capacityRosterViewSearchMenu').hide();
    $('.fp-header-icons').hide();
    getCheckbox();
  });

  function getData(){
    let rosterData = [];
    const roster = $('#cspDATable')[0].children[1].children;

    let id, name, shiftLength, startTime, endTime, item;

    for(let i = 0; i < roster.length; i++){

      id = roster[i].children[0].innerText;
      name = roster[i].children[1].innerText;
      shiftLength = roster[i].children[4].innerText;
      startTime = roster[i].children[5].innerText;
      endTime = roster[i].children[6].innerText;

      item = {
        id: id,
        name: name,
        shiftLength: shiftLength,
        startTime: startTime,
        endTime: endTime
      }

      rosterData.push(item)

    }
    createTable(rosterData, appendTable)
    createCounterTable(rosterData)
  }

  function createTable(data, callback){
    let array = data;

    let input =  "<div class='input-group input-group-sm mb-3'>" +
                    "<input type='text' id='mysearchbar' class='form-control' placeholder='Search Name Here....' />" +
                  "</div>"

    let table = input +
      "<table class='table table-hover' id='flexTable'>" +
        "<thead>" +
          "<tr>" +
            "<th class='font-weight-bold'>Name</th>" +
            "<th class='text-center font-weight-bold'>ID</th>" +
            "<th class='text-center font-weight-bold'>Shift Length</th>" +
            "<th class='text-center font-weight-bold'>Start Time</th>" +
            "<th class='text-center font-weight-bold'>End Time</th>" +
            "<th class='text-center font-weight-bold'>Check In</th>" +
          "</tr>" +
        "</thead>" +
        "<tbody>"

    for(let i = 0; i < array.length; i++){
      table +=
        "<tr class='range-click' id=" + array[i]['id'] + ">" +
          "<td>" + array[i]['name'] + "</td>" +
          "<td class='text-center no-line-height'>" + array[i]['id'] + "</td>" +
          "<td class='text-center no-line-height'>" + array[i]['shiftLength'] + "</td>" +
          "<td class='text-center no-line-height'>" + array[i]['startTime'] + "</td>" +
          "<td class='text-center no-line-height'>" + array[i]['endTime'] + "</td>" +
          "<td class='center no-line-height '>" +
            "<input type='checkbox' class='checkbox' value=" + array[i]['id'] + " /></td>" +
        "<tr>"
    }
    table += "</tbody></table>";

    callback(table);
  }

  function appendTable(table){
    $('#pageRosterViewContent').before(table);
    $('#mysearchbar').keyup(filter);
  }

  function filter(){
    let input, filter, table, tr, td, i;
    input = document.getElementById('mysearchbar');
    filter = input.value.toUpperCase();
    table = document.getElementById("flexTable");
    tr = table.getElementsByTagName("tr");

    for(let i = 0; i < tr.length; i++){
      td = tr[i].getElementsByTagName("td")[0];
      if(td){
        if(td.innerHTML.toUpperCase().indexOf(filter) > - 1){
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }

  function createCounterTable(data){
    let tableData = {};
    let item = {};
    let block;
    let blockId;
    let table = "<table class='table' id='counterTable'>" +
      "<thead>" +
        "<tr>" +
          "<th class='text-center'>Block</th>" +
          "<th class='text-center'>Shift Length</th>" +
          "<th class='text-center'>Total(Accepted)</th>" +
          "<th class='text-center'>Checkin(Actual)</th>" +
          "<th class='text-center'>No Show</th>" +
        "</tr>" +
      "</thead>" + "<tbody>"

    for(let i = 0; i < data.length; i++){
      block = data[i]['startTime'] + " - " + data[i]['endTime']
      if(tableData[block] === undefined){
        item = {
          total: 1,
          checkin: 0,
          noShow: 1,
          shiftLength: data[i]['shiftLength']
        }
        tableData[block] = item
      } else {
        tableData[block]['total']++
        tableData[block]['noShow']++
      }
    }

    for(block in tableData){
      let b = block.replace(/[\s\:]/g, "");
      table += "<tr id=" + b + ">" +
        "<td class='text-center'>" + block + "</td>" +
        "<td class='text-center'>" + tableData[block]['shiftLength'] + "</td>" +
        "<td class='text-center'>" + tableData[block]['total'] + "</td>" +
        "<td class='text-center'>" + tableData[block]['checkin'] + "</td>" +
        "<td class='text-center'>" + tableData[block]['noShow'] +
      "</tr>"
    }

    table += "</tbody></table>"
    $('.fp-container').before(table);

    //socket.emit('rosterTable', {data: table})
    socket.emit('newBlock', table)
  }

  function getCheckbox(){
    let id, tr, bool, name, shiftLength, startTime, endTime, block, rosterData;
    $('tr.range-click').click(function(event){

      if(event.target.className != 'checkbox'){
        id = $(this)[0].id;

        bool = !($(this)[0].children[5].children[0].checked);
        $(this)[0].children[5].children[0].checked = bool;

        name = $(this)[0].children[0].innerText;
        shiftLength = $(this)[0].children[2].innerText;
        startTime = $(this)[0].children[3].innerText;
        endTime = $(this)[0].children[4].innerText;
        block = (startTime + " - " + endTime).replace(/[\s\:]/g, '');
        rosterData = $('tr#' + block)
        if(bool){
          rosterData[0].children[3].innerText++;
          rosterData[0].children[4].innerText--;
        } else {
          rosterData[0].children[3].innerText--;
          rosterData[0].children[4].innerText++;
        }
        const table = $('#counterTable')[0].outerHTML;
        socket.emit('sameBlock', table);
      } else {
        id = $(this)[0].id;
        bool = !($(this)[0].children[5].children[0].checked);
        $(this)[0].children[5].children[0].checked = !bool;
        tr = ($('tr#' + id));

        startTime = tr[0].children[3].innerText;
        endTime = tr[0].children[4].innerText;
        block = (startTime + " - " + endTime).replace(/[\s\:]/g, '');
        rosterData = $('tr#' + block)

        if(!bool){
          rosterData[0].children[3].innerText++;
          rosterData[0].children[4].innerText--;
        } else {
          rosterData[0].children[3].innerText--;
          rosterData[0].children[4].innerText++;
        }
        const table = $('#counterTable')[0].outerHTML;
        socket.emit('sameBlock', table);
      }

    })
  }

})
