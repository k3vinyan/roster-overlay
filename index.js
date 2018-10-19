import $ from 'jquery';
import io from 'socket.io-client';
import moment from 'moment';

$( document ).ready(function(){
  const socket = io('http://amazon-yard.herokuapp.com');
  const getDataButton = document.createElement('button');
  getDataButton.innerText = 'Create Roster';
  getDataButton.id = 'getDataButton';
  getDataButton.type = 'button';
  getDataButton.classList.add("btn", "btn-outline-primary", "button-center")

  const hideDataButton = document.createElement('button');
  hideDataButton.innerText = 'Unplanned Table';
  hideDataButton.id = 'hideDataButton';
  hideDataButton.type = 'button';
  hideDataButton.classList.add("btn", "btn-outline-warning", "button-center");

  $('#capacityRosterViewSearchMenu').append(getDataButton);
  $('#capacityRosterViewSearchMenu').append(hideDataButton);

  $('#getDataButton').click(function(){
    $('#counterTable').remove();
    $('#flexTable').remove();
    $('#searchbar-container').remove();
    $('.fp-navigation-container').css('height', '10px');
    $('#pageRosterViewContent').hide();
    $('.fp-header-icons').hide();
    const data = getData();
    ajaxRequest(data);
  });

  $('#hideDataButton').click(function(){
    $('#counterTable').toggle()
  });

  function getData(){
    let id, name, shiftLength, startTime, endTime, item, block;
    let rosterData = [];
    const roster = $('#cspDATable')[0].children[1].children;

    for(let i = 0; i < roster.length; i++){
      id = roster[i].children[0].innerText;
      name = roster[i].children[1].innerText;
      shiftLength = roster[i].children[4].innerText;
      startTime = roster[i].children[5].innerText;
      endTime = roster[i].children[6].innerText;
      block = (startTime + "-" + endTime).replace(/\s+/g, '');
      item = {
        id: id,
        name: name,
        shiftLength: shiftLength,
        startTime: startTime,
        endTime: endTime,
        block: block
      }
      rosterData.push(item)
    }
    return rosterData;
  }

  function createTable(callback){
    const today = moment().format('MM-DD-YYYY');
    let table;
    $.ajax({
      url: 'http://amazon-yard.herokuapp.com/api/drivers/' + today,
      method: 'GET',
      success: function(response){
        createCounterTable(response)
        let array = response;
        let input =  "<div class='input-group input-group-sm mb-3' id='searchbar-container'>" +
                        "<input type='text' id='mysearchbar' class='form-control' placeholder='Search Name Here....' />" +
                      "</div>"

        table = input +
          "<table class='table table-hover' id='flexTable' >" +
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
          const check = array[i]['checkin']
          if(!check){
            table +=
              "<tr class='range-click' id=" + array[i]['_id'] + ">" +
                "<td>" + array[i]['name'] + "</td>" +
                "<td class='text-center no-line-height'>" + array[i]['driverId'] + "</td>" +
                "<td class='text-center no-line-height'>" + array[i]['shiftLength'] + "</td>" +
                "<td class='text-center no-line-height'>" + array[i]['startTime'] + "</td>" +
                "<td class='text-center no-line-height'>" + array[i]['endTime'] + "</td>" +
                "<td class='center no-line-height '>" +
                  "<input type='checkbox' class='checkbox' value=" + array[i]['_id'] + " /></td>" +
              "<tr>"
          } else {
            table +=
              "<tr class='range-click' id=" + array[i]['_id'] + ">" +
                "<td>" + array[i]['name'] + "</td>" +
                "<td class='text-center no-line-height'>" + array[i]['driverId'] + "</td>" +
                "<td class='text-center no-line-height'>" + array[i]['shiftLength'] + "</td>" +
                "<td class='text-center no-line-height'>" + array[i]['startTime'] + "</td>" +
                "<td class='text-center no-line-height'>" + array[i]['endTime'] + "</td>" +
                "<td class='center no-line-height '>" +
                  "<input type='checkbox' class='checkbox' value=" + array[i]['_id'] + " checked/></td>" +
              "<tr>"
          }
        }
        table += "</tbody></table>";
        callback(table);
      },
      error: function(error){
        console.log(error)
      }
    })


  }

  function appendTable(table){
    $('#pageRosterViewContent').before(table);
    getCheckbox();
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
    let table = "<table class='table' id='counterTable' style='display: none;'>" +
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
      if(tableData[block] === undefined && !data[i]['checkin']){
        item = {
          total: 1,
          checkin: 0,
          noShow: 1,
          shiftLength: data[i]['shiftLength']
        }
        tableData[block] = item
      } else if(tableData[block] === undefined && data[i]['checkin']){
        item = {
          total: 1,
          checkin: 1,
          noShow: 0,
          shiftLength: data[i]['shiftLength']
        }
        tableData[block] = item
      } else if(!data[i]['checkin']){
        tableData[block]['total']++
        tableData[block]['noShow']++
      } else {
        tableData[block]['total']++
        tableData[block]['checkin']++
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
  }

  function getCheckbox(){
    let id, tr, bool, name, shiftLength, startTime, endTime, block, rosterData;

    $('tr.range-click').click(function(event){
      if(event.target.className != 'checkbox'){
        console.log(this)
        id = $(this)[0].id;
        console.log(id)
        bool = !($(this)[0].children[5].children[0].checked);
        console.log("range: " + bool)
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
      } else {
        id = $(this)[0].id;
        bool = ($(this)[0].children[5].children[0].checked);
        $(this)[0].children[5].children[0].checked = bool;
        tr = ($('tr#' + id));

        startTime = tr[0].children[3].innerText;
        endTime = tr[0].children[4].innerText;
        block = (startTime + " - " + endTime).replace(/[\s\:]/g, '');
        rosterData = $('tr#' + block)

        if(bool){
          rosterData[0].children[3].innerText++;
          rosterData[0].children[4].innerText--;
        } else {
          rosterData[0].children[3].innerText--;
          rosterData[0].children[4].innerText++;
        }
      }
      const driver = {
        _id: id,
        driverId: id,
        block: block,
        startTime: startTime,
        endTime: endTime,
        checkin: bool
      }
      socket.emit('check', driver);
    })
  }

  function ajaxRequest(data){

    $.ajax({
      url: 'http://amazon-yard.herokuapp.com/api/drivers/',
      method: 'POST',
      data: {data: JSON.stringify(data)},
      success: function(response){
        createTable(appendTable)
      },
      error: function(error){
        console.log(error)
      }
    })
  }

})
