var HolyDays = function () {
  var $ = jQuery;

  var _now = new Date();

  var _dateInfos = null;
  var _msInDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  var _locationLong = 0;
  var _locationLat = 0;
  var _timeoutLoad = null;
  var _startup2Done = false;

  function startup2() {
    if (_startup2Done) return;

    clearTimeout(_timeoutLoad);
    FillHead();
    FillYearsList();
    FillChoices();

    ApplyFilters();

    $('#DesiredYear').trigger('change');

    _startup2Done = true;
  }

  function startup() {
    _timeoutLoad = setTimeout(function () {
      startup2();
    }, 500);
    LoadSunCalc(startup2);
  }

  function FillHead() {
    var timeZoneName;
    try{
      timeZoneName = new Date().toString().match(/\((.*)\)/)[1];
    }catch(e){}
    var html =
    '<p>The dates shown below are correct based on the changes introduced in 171 B.E. by the Universal House of Justice and are defined until ' + _lastYearDefined + ' B.E.</p>'
  + '<p class=Beta>Please notify <a href="mailto:glen.little@gmail.com">Glen Little</a> of any problems or suggestions! Hover over each <span class=help title="This is a tip!"></span> for more information...</p>'
  + '<div class="SelectorArea">'
    + '<div class="Selectors">'
    + '<div class="YearSelect">Year: <select accesskey=Y id="DesiredYear"></select></div>'
      + '<div id=yearComment1 class="Hidden YearComment">* Naw Rúz in year <span class=bYear></span> falls on March ' + (19 + '/').eveInfo() + '20.</div>'
      + '<div id=yearComment2 class="Hidden YearComment">** Naw Rúz in year <span class=bYear></span> falls on March ' + (18 + '/').eveInfo() + '19.</div>'
    + '<div></div>'
    + '<span class="HolyDayHS"><input id="WantHolyDay" type="checkbox" accesskey="H" /><label for="WantHolyDay"> Holy Days</label></span>'
    + '<span class="Feast"><input id="WantFeast" type="checkbox" accesskey="M" /><label for="WantFeast"> Months/Feasts</label></span>'
    + '<span class="OtherDay"><input id="WantOther" type="checkbox" accesskey="O" /><label for="WantOther"> Other Events</label></span>'
    + '<span class="Fast"><input id="WantFast" type="checkbox" accesskey="F" /><label for="WantFast"> Fast Days</label></span>'
  + '</div>'
  + '</div>'
    + '<div class=SelectorOptions>'
    + '<span><input id="ShowToday" type="checkbox" accesskey="T" /><label for="ShowToday"><i> Show Today</i></label> <span class="help" title="Only shows in the current year."></span></span>'
    + '<span><input id="ShowEve" type="checkbox" accesskey="E" /><label for="ShowEve"><i> Show Eve Dates</i></label> <span class="help" title="Days in the Bahá’í calendar start at sunset on the eve (before) the main part of the day."></span></span>'
    + '<span class=LatLong><input id="ShowSunset" type="checkbox" accesskey="U" /><label for="ShowSunset"><i> Show Local Sunset Times</i></label>'
       + '<div class=Sunset><i>This computer is currently in the ' + timeZoneName + '.</i> <span class="help" title="Tip: You computer\'s clock is used to determine daylight savings start and end times throughout the year."></span></div>'
       + '<div class="Hidden Sunset">Lat: <input id=lat> Long: <input id=long>'
         + '<button type=button id=getLocation>Learn for my location</button> <span class="help" title="Tip: if clicking the button fails, you could find your location in Google Maps, then\ncopy the Latitude and Longitude numbers from the URL address after the @."></span></div>'
       + '<span title="Nearest location" class=Sunset id=latLongName></span>'
       + '</span>'
    + '<span id=printBtnArea><button type=button onclick="print()">Print</button></span>'
    + '<div class=Clear></div>'
  + '</div>'
    + '<div class=Clear></div>';

    $('#CalHead').html(html);

    $('.List').html(
       '<table id=List><thead>'
       + '<tr>'
       + '<th colspan=3>Year <span class=showYear></span></th>'
       + '<th class=Sunset>Ending</th>'
       + '<th class=Gregorian colspan=3>Gregorian (Bahá’í days start at sunset on the eve prior to start of the Gregorian day.)</th>'
       + '</tr>'
       + '<tr>'
       + '<th class=Num>#</th>'
       + '<th class=Name1>Name</th>'
       + '<th>Dates</th>'
       + '<th class=Sunset>Sunset</th>'
       + '<th class=Gregorian>Week Day</th>'
       + '<th class=Gregorian>Date</th>' //(<span class=gYear></span>)
       + '<th class="Gregorian ForFeast ForStartTime">Event Time <select class=Feast id=StartTime><option value=1900>Start 7:00pm</option><option value=1930>Start 7:30pm</option><option value=2000>Start 8:00pm</option></select><span class="help" title="Tip: Select the desired start time to know if the event falls before or after sunset."></span></th>'
//       + '<th class=Gregorian>Dates</th>'
       + '</tr>'
       + '</thead><tbody>'
       + '</tbody></table>'
       + '<p class=footer>Last modified on 7 Bahá (Splendor) 172.</p>'
       );
  }


  function ApplyFilters() {
    var wantFeast = $('#WantFeast').prop('checked');
    var wantHolyDay = $('#WantHolyDay').prop('checked');
    var wantOther = $('#WantOther').prop('checked');
    var wantFast = $('#WantFast').prop('checked');

    $('.List')
      .toggleClass('ShowFeast', wantFeast)
      .toggleClass('ShowHolyDay', wantHolyDay)
      .toggleClass('ShowOther', wantOther)
      .toggleClass('ShowFast', wantFast)
      .toggleClass('NoSelection', !(wantFeast || wantFast || wantHolyDay || wantOther));

    $('#content')
      .toggleClass('ShowToday', $('#ShowToday').prop('checked'))
      .toggleClass('ShowEve', $('#ShowEve').prop('checked'))
      .toggleClass('ShowSunset', $('#ShowSunset').prop('checked'))
  }

  function FillChoices() {
    if (localStorage.WantFeast == null) {
      localStorage.WantFeast = 'true';
      localStorage.WantHolyDay = 'true';
      localStorage.WantOther = 'false';
      localStorage.WantFast = 'false';
      localStorage.ShowToday = 'true';
      localStorage.ShowEve = 'true';
      localStorage.ShowSunset = 'false';
    }

    $('#WantFeast')
       .click(function () { ApplyFilters(); localStorage.WantFeast = $(this).prop('checked'); })
       .prop('checked', localStorage.WantFeast == 'true');

    $('#WantHolyDay')
       .click(function () { ApplyFilters(); localStorage.WantHolyDay = $(this).prop('checked'); })
       .prop('checked', localStorage.WantHolyDay == 'true');

    $('#WantOther')
       .click(function () { ApplyFilters(); localStorage.WantOther = $(this).prop('checked'); })
       .prop('checked', localStorage.WantOther == 'true');

    $('#WantFast')
       .click(function () { ApplyFilters(); localStorage.WantFast = $(this).prop('checked'); })
       .prop('checked', localStorage.WantFast == 'true');

    $('#ShowEve')
       .click(function () { ApplyFilters(); localStorage.ShowEve = $(this).prop('checked'); })
       .prop('checked', localStorage.ShowEve == 'true');

    $('#ShowToday')
       .click(function () { ApplyFilters(); localStorage.ShowToday = $(this).prop('checked'); })
       .prop('checked', localStorage.ShowToday == 'true');

    $('#ShowSunset')
       .click(function () { ApplyFilters(); localStorage.ShowSunset = $(this).prop('checked'); })
       .prop('checked', localStorage.ShowSunset == 'true');

    var ddlYear = $('#DesiredYear');
    ddlYear
       .change(function () { showDatesInYear($('.List'), ddlYear.val()); localStorage.Year = ddlYear.val(); })
       .val(localStorage.Year || _now.getBadiYear());
    if (!ddlYear.val()) {
      ddlYear.val(_now.getBadiYear());
    }

    var ddlStartTime = $('#StartTime');
    ddlStartTime
       .change(function () { showDatesInYear($('.List'), ddlYear.val()); localStorage.StartTime = ddlStartTime.val(); })
       .val(localStorage.StartTime || '1930');

    $('#lat').change(function (ev) {
      _locationLat = +ev.target.value;
      localStorage.lat = _locationLat;
      showLocation();
    }).val(_locationLat = +localStorage.lat || 0);

    $('#long').change(function (ev) {
      _locationLong = +ev.target.value;
      localStorage.long = _locationLong;
      showLocation();
    }).val(_locationLong = +localStorage.long || 0);

    showLocation();

    $('#getLocation').click(function () {
      try {
        navigator.geolocation.getCurrentPosition
        navigator.geolocation.getCurrentPosition(function (loc) {
          $('#lat').val(localStorage.lat = _locationLat = loc.coords.latitude);
          $('#long').val(localStorage.long = _locationLong = loc.coords.longitude);
          showLocation();
          $('#DesiredYear').trigger('change');
        })
      } catch (e) {
        console.log(e);
      }
    });

    $(document).on('keydown', function (ev) {
      if (ev.target.tagName === 'INPUT') {
        return;
      }
      var arrowRight = 39;
      var arrowLeft = 37;
      var delta = 0;
      if (ev.which == arrowRight) {
        delta = 1;
      }
      if (ev.which == arrowLeft) {
        delta = -1;
      }
      if (delta) {
        var ddl = $('#DesiredYear');
        var select = ddl[0];
        if (delta == 1 && select.selectedIndex < select.options.length - 1
           || delta == -1 && select.selectedIndex > 0) {
          select.selectedIndex = select.selectedIndex + delta;;
          ddl.trigger('change');
          ev.preventDefault();
        }
      }
    });
  }

  function ShowBYearWithGYear(bYear){
    var gYear = bYear + 1843;
    return bYear + ' (' + gYear + '-' + ('0' + ((gYear + 1) % 100)).substr(-2) + ')'
  }
  
  function FillYearsList() {
    var options = [];
    for (var i = 1; i <= _lastYearDefined; i++) {

      var nawRuzOffset = _nawRuzOffsetFrom21[i];
      var note = nawRuzOffset == -1 ? '*'   // in order of likelihood
                : nawRuzOffset == -2 ? '**'
                : '';

      options.push('<option value=' + i + '>' + ShowBYearWithGYear(i)
          + note
          + '</option>');
    }

    var currentBYear = _now.getFullYear() - 1843 + _now.isAfterNawRuz();
    $('#DesiredYear')
      .append(options.join('\n'))
      .val(currentBYear);

  }

  function prepareDateInfos(bYear) {
    _dateInfos = dateInfosRaw();

    // add fast times
    for (var d = 1; d <= 19; d++) {
      _dateInfos.push(
        { Type: 'Fast', BDateCode: '19.' + d, NameEn: 'Fast - day ' + d }
      );
    }

    // add today
    var bNow = getBDate(_now);
    $('body').removeClass('hasToday')
    if (bNow.y == bYear) {
      $('body').addClass('hasToday')
      _dateInfos.push(
        {
          Type: 'Today', BMonthDay: bNow, NameEn: 'Today',
          Time: ('0' + _now.getHours()).slice(-2) + ('0' + _now.getMinutes()).slice(-2)
        }
      );
      //console.log(_dateInfos[_dateInfos.length-1]);
    }

    for (var i = 0; i < _dateInfos.length; i++) {
      var dateInfo = _dateInfos[i];

      if (dateInfo.UntilYear && bYear > dateInfo.UntilYear) {
        _dateInfos.splice(i, 1);
        i--;
        continue;
      }
      if (dateInfo.FromYear && bYear < dateInfo.FromYear) {
        _dateInfos.splice(i, 1);
        i--;
        continue;
      }


      if (dateInfo.BDateCode) {
        dateInfo.BMonthDay = splitToBMonthDay(dateInfo.BDateCode);
      }

      if (dateInfo.BDateCodeTo) {
        dateInfo.BMonthDayTo = splitToBMonthDay(dateInfo.BDateCodeTo);
      }

      if (dateInfo.Type == 'M') {
        dateInfo.BMonthDay = makeBMonthDay(dateInfo.MonthNum, 1);
        dateInfo.BMonthDayTo = makeBMonthDay(dateInfo.MonthNum, 19);
      }

      if (dateInfo.Type.slice(0, 1) == 'H') {
        if (!dateInfo.Time) {
          dateInfo.Time = $('#StartTime').val();
        }
      }

      var special = dateInfo.Special;
      if (special) {
        var specialParts = special.split('.');
        var specialPartB = specialParts[1];
        switch (specialParts[0]) {
          case 'THB':
            var firstDayCode = _twinHolyBirthdays[bYear];
            if (firstDayCode) {
              dateInfo.BMonthDay = splitToBMonthDay(firstDayCode);
              if (specialPartB == '2') {
                dateInfo.BMonthDay.d++;
                if (dateInfo.BMonthDay.d == 20) {
                  dateInfo.BMonthDay.m++;
                  dateInfo.BMonthDay.d = 1;
                }
              }
            } else {
              console.log('Twin Holy Birthdays unknown for year ' + bYear);
              console.log(dateInfo);
              dateInfo.BMonthDay = makeBMonthDay(12, 2);
            }
            break;

          case 'AYYAM':
            dateInfo.BMonthDay = makeBMonthDay(0, 1);

            var firstAyyamiHa = new Date(getGDateYMD(bYear, 18, 19));
            firstAyyamiHa.setDate(firstAyyamiHa.getDate() + 1);

            var lastAyyamiHa = new Date(getGDateYMD(bYear, 19, 1));
            lastAyyamiHa.setDate(lastAyyamiHa.getDate() - 1);

            var numDaysInAyyamiHa = 1 + Math.round(Math.abs((firstAyyamiHa.getTime() - lastAyyamiHa.getTime()) / _msInDay));
            dateInfo.BMonthDayTo = makeBMonthDay(0, numDaysInAyyamiHa);

            dateInfo.GYearOffset = 1;

            break;

          case 'JAN1':
            var jan1 = getGDateYMD(bYear, 17, 1); // start with a date just after jan1
            jan1.setDate(1);
            dateInfo.GDate = jan1;
            dateInfo.GYearOffset = 1;

            var sharaf1 = getGDateYMD(bYear, 16, 1);
            if (sharaf1 < jan1) {
              var day = 33 - sharaf1.getDate();
              dateInfo.BMonthDay = makeBMonthDay(16, day);
            }
            else if (sharaf1.getTime() == jan1.getTime()) {
              dateInfo.BMonthDay = makeBMonthDay(16, 1);
            }
            else {
              // may be possible in extreme cases
              dateInfo.BMonthDay = makeBMonthDay(15, 20 - daysBetween(jan1, sharaf1));
            }

            break;
        }
      }

      if (dateInfo.BMonthDay.m > 16) {
        dateInfo.GYearOffset = 1;
      }

      dateInfo.gYear = 1843 +
                      +bYear +
                      +(dateInfo.GYearOffset || 0);

      if (!dateInfo.GDate) {
        dateInfo.GDate = getGDateYBDate(bYear, dateInfo.BMonthDay);
      }

      if (dateInfo.BMonthDayTo) {
        dateInfo.GDateTo = getGDateYBDate(bYear, dateInfo.BMonthDayTo);
      }

      dateInfo.Sort = (dateInfo.BMonthDay.m == 0 ? 1850 : dateInfo.BMonthDay.m * 100) + dateInfo.BMonthDay.d;
    }

    _dateInfos.sort(function (a, b) {
      // try{
      // if(a.BMonthDay.m == 19){
      // if(a.Sort == b.Sort) debugger;
      // }
      // }catch(e){
      // console.log(e);
      // console.log(a);
      // }
      if (!b.BMonthDay) {
        return -1;
      }
      if (!a.BMonthDay) {
        return 1;
      }

      if (a.Sort < b.Sort) {
        return -1;
      }
      if (a.Sort > b.Sort) {
        return 1;
      }

      // same date
      if (a.Type == 'M') {
        // month first
        return -1;
      }
      if (b.Type == 'M') {
        // month first
        return 1;
      }
      if (a.Type == 'OtherRange') {
        return -1;
      }
      if (b.Type == 'OtherRange') {
        return 1;
      }
      return 0;
    });
  }

  function showDatesInYear(host, bYear) {
    var rows = [];
    bYear = +bYear;

    prepareDateInfos(bYear);

    $('.YearComment').hide();
    var nawRuzOffset = _nawRuzOffsetFrom21[bYear];
    var yearNote = nawRuzOffset == -1 ? 1
                  : nawRuzOffset == -2 ? 2
                  : 0;
    $('#yearComment' + yearNote).fadeIn();

    var thbWarningGiven = false;

    var gYear = bYear + 1843;
    $('.bYear').text(bYear);
    $('.showYear').text(ShowBYearWithGYear(bYear));
    $('.gYear').text(gYear);

    for (var i = 0; i < _dateInfos.length; i++) {
      var dateInfo = _dateInfos[i];

      // if(dateInfo.skip){
      // continue;
      // }

      //var gDayOffset = _nawRuzOffsetFrom21[gYear] || 0;
      //console.log(dateInfo);
      //console.log(dateInfo.GDate);



      if (dateInfo.Type == 'M') {
        rows.push(
           '<tr class=Feast>'
         + '<td class=Num>' + dateInfo.MonthNum + '</td>'
         + '<td class=Name2>' + dateInfo.NameAr + ' (' + dateInfo.NameEn + ')</td>'
         + '<td class=FromTo>' + ShortBadi({ m: dateInfo.MonthNum, d: 1 }) + ' - 19</td>'
         + '<td class=Sunset data-gdate="' + dateInfo.GDate.getTime() + '"></td>'
         + '<td>' + dateInfo.GDate.getDayNames() + '</td>'
         + '<td class=SpecificDay>' + ShortGregDate(dateInfo.GDate) + ', ' + dateInfo.gYear + '</td>'
         + '<td class="ForFeast" data-gdate="' + dateInfo.GDate.getTime() + '"></td>'
         + '</tr>'
         );
      }

      else if (dateInfo.Type.substr(0, 1) == 'H') {
        // both types of Holy Days HS, HO - just CSS is different
        //console.log(dateInfo);

        if (dateInfo.Special && dateInfo.Special.slice(0, 3) == 'THB' && bYear > _lastTwinHolyBirthdayDefined) {
          if (!thbWarningGiven) {
            rows.push('<tr class="NotDefined HolyDay"><td colspan=9>The Twin Holy Birthdays are not yet defined for this year.</td></tr>');
            thbWarningGiven = true;
          }
          continue;
        }


        rows.push(
             '<tr class="HolyDay HolyDay' + dateInfo.Type + '">'
           + '<td class=blank></td>'
           + '<td class=NameLong>' + dateInfo.NameEn + '</td>'
           + '<td>' + ShortBadi(dateInfo.BMonthDay) + '</td>'
           + '<td class=Sunset data-gdate="' + dateInfo.GDate.getTime() + '"></td>'
           + '<td>' + dateInfo.GDate.getDayNames() + '</td>'
           + '<td class=SpecificDay>' + ShortGregDate(dateInfo.GDate) + ', ' + dateInfo.gYear + '</td>' //+ ', ' + dateInfo.gYear
           + '<td class="ForStartTime"' + (dateInfo.TimeReason ? (' title="' + dateInfo.TimeReason + '"') : '') + '" data-time="' + (dateInfo.Time || '') + '" data-gdate="' + dateInfo.GDate.getTime() + '"></td>'
           + '</tr>'
           );
      }

      else if (dateInfo.Type == 'OtherRange') {
        var otherRangeName = dateInfo.NameAr ? (dateInfo.NameAr + ' (' + dateInfo.NameEn + ')') : dateInfo.NameEn;
        rows.push(
             '<tr class=OtherDay>'
           + '<td class=blank></td>'
           + '<td class=NameLong>' + otherRangeName + '</td>'
           + '<td>' + ShortBadi(dateInfo.BMonthDay) + ' - ' + (dateInfo.BMonthDay.m == dateInfo.BMonthDayTo.m ? dateInfo.BMonthDayTo.d : ShortBadi(dateInfo.BMonthDayTo)) + '</td>'
           + '<td class=Sunset></td>'
           + '<td>' + dateInfo.GDate.getDayNames() + ' - ' + dateInfo.GDateTo.getDayNames() + '</td>'
           // all date ranges are in same gYear, so don't need to check 
           + '<td class=SpecificDay>' + ShortGregDate(dateInfo.GDate) + ' - ' + ShortGregDate(dateInfo.GDateTo) + ', ' + dateInfo.gYear + '</td>'
           + '<td class=ForFeast></td>'
           //+ '<td class=FromTo>' + ShortGregDate(dateInfo.GDate) + ' - ' + ShortGregDate(dateInfo.GDateTo) + '</td>'
           + '</tr>'
           );
      }

      else if (dateInfo.Type == 'OtherDay') {
        rows.push(
             '<tr class=' + dateInfo.Type + '>'
           + '<td class=blank></td>'
           + '<td class=NameLong>' + dateInfo.NameEn + '</td>'
           + '<td>' + ShortBadi(dateInfo.BMonthDay) + '</td>'
           + '<td class=Sunset data-gdate="' + dateInfo.GDate.getTime() + '"></td>'
           + '<td>' + dateInfo.GDate.getDayNames() + '</td>'
           + '<td class=SpecificDay>' + ShortGregDate(dateInfo.GDate) + ', ' + dateInfo.gYear + '</td>'
           + '<td class=ForFeast></td>'
           + '</tr>'
           );
      }

      else if (dateInfo.Type == 'Today') {
        rows.push(
             '<tr class=' + dateInfo.Type + '>'
           + '<td class=blank></td>'
           + '<td class=NameLong>' + dateInfo.NameEn + '</td>'
           + '<td>' + ShortBadi(dateInfo.BMonthDay) + '</td>'
           + '<td class=Sunset data-gdate="' + dateInfo.GDate.getTime() + '"></td>'
           + '<td>' + dateInfo.GDate.getDayNames() + '</td>'
           + '<td class=SpecificDay>' + ShortGregDate(dateInfo.GDate) + ', ' + dateInfo.gYear + '</td>'
           + '<td class="ForStartTime Today" data-time="' + dateInfo.Time + '" data-gdate="' + dateInfo.GDate.getTime() + '"></td>'
           + '</tr>'
           );
      }

      else if (dateInfo.Type == 'Fast') {
        rows.push(
             '<tr class=' + dateInfo.Type + '>'
           + '<td class=blank></td>'
           + '<td class=NameLong>' + dateInfo.NameEn + '</td>'
           + '<td>' + ShortBadi(dateInfo.BMonthDay) + '</td>'
           + '<td class="FastTimes Sunset"><span class=Sunrise data-gdate="' + dateInfo.GDate.getTime() + '"></span> - <span class=Sunset data-gdate="' + dateInfo.GDate.getTime() + '"></span></td>'
           + '<td>' + dateInfo.GDate.getDayNames() + '</td>'
           + '<td class=SpecificDay>' + ShortGregDate(dateInfo.GDate) + ', ' + dateInfo.gYear + '</td>'
           + '<td class=ForFeast></td>'
           + '</tr>'
           );
      }

      else {
        rows.push('<tr><td colspan=7>?1?</td></tr>')
      }
    }

    rows.push('<tr id=NoSelection><td colspan=9>Please choose what dates to show!</td></tr>')

    host.find('tbody').html(rows.join('\n'));

    AddSunsetTimes();
  }

  var dateInfosRaw = function () {
    return [
    /* fields
       Type - M (Month),HS (Holy Day standard),HO (Holy Day other),OtherDay,OtherRange
       NameEn - English name
       NameAr - Arabic name
       MonthNum - Badi month number
       BDateCode - MM.DD month and day in Badi calendar (calculated for Month entries)
       BDateCodeTo - last day of a range - MM.DD month and day in Badi calendar (calculated for Month entries)
       UntilYear - Badi year this day is in effect until
       FromYear - Badi year this day is in effect from
    */
    { Type: 'M', NameEn: 'Splendor', NameAr: 'Bah&aacute;', MonthNum: 1 },
    { Type: 'M', NameEn: 'Glory', NameAr: 'Jal&aacute;l', MonthNum: 2 },
    { Type: 'M', NameEn: 'Beauty', NameAr: 'Jam&aacute;l', MonthNum: 3 },
    { Type: 'M', NameEn: 'Grandeur', NameAr: '`Azamat', MonthNum: 4 },
    { Type: 'M', NameEn: 'Light', NameAr: 'N&uacute;r', MonthNum: 5 },
    { Type: 'M', NameEn: 'Mercy', NameAr: 'Rahmat', MonthNum: 6 },
    { Type: 'M', NameEn: 'Words', NameAr: 'Kalim&aacute;t', MonthNum: 7 },
    { Type: 'M', NameEn: 'Perfection', NameAr: 'Kam&aacute;l', MonthNum: 8 },
    { Type: 'M', NameEn: 'Names', NameAr: "Asm&aacute;'", MonthNum: 9 },
    { Type: 'M', NameEn: 'Might', NameAr: '`Izzat', MonthNum: 10 },
    { Type: 'M', NameEn: 'Will', NameAr: 'Mash&iacute;yyat', MonthNum: 11 },
    { Type: 'M', NameEn: 'Knowledge', NameAr: '`Ilm', MonthNum: 12 },
    { Type: 'M', NameEn: 'Power', NameAr: 'Qudrat', MonthNum: 13 },
    { Type: 'M', NameEn: 'Speech', NameAr: 'Qawl', MonthNum: 14 },
    { Type: 'M', NameEn: 'Questions', NameAr: "Mas&aacute;'&iacute;l", MonthNum: 15 },
    { Type: 'M', NameEn: 'Honor', NameAr: 'Sharaf', MonthNum: 16 },
    { Type: 'M', NameEn: 'Sovereignty', NameAr: 'Sult&aacute;n', MonthNum: 17 },
    { Type: 'M', NameEn: 'Dominion', NameAr: 'Mulk', MonthNum: 18 },
    { Type: 'M', NameEn: 'Loftiness', NameAr: "`Al&aacute;'", MonthNum: 19 },

    { Type: 'HS', BDateCode: '1.1', NameEn: 'Naw R&uacute;z' },
    { Type: 'HS', BDateCode: '2.13', NameEn: 'First Day of Ridv&aacute;n', Time: '1500S', TimeReason: '3 pm Standard time' },
    { Type: 'HS', BDateCode: '3.2', NameEn: 'Ninth Day of Ridv&aacute;n' },
    { Type: 'HS', BDateCode: '3.5', NameEn: 'Twelveth Day of Ridv&aacute;n' },
    { Type: 'HS', BDateCode: '4.13', NameEn: "Ascension of Bah&aacute;'u'll&aacute;h", Time: '0300S', TimeReason: '3 am Standard time' },

    { Type: 'HS', UntilYear: 171, BDateCode: '4.7', NameEn: 'Declaration of the B&aacute;b', Time: 'SS+2', TimeReason: 'about 2 hours after sunset' },
    { Type: 'HS', FromYear: 172, BDateCode: '4.8', NameEn: 'Declaration of the B&aacute;b', Time: 'SS+2', TimeReason: 'about 2 hours after sunset' },

    { Type: 'HS', UntilYear: 171, BDateCode: '6.16', NameEn: 'Martyrdom of the B&aacute;b', Time: '1200S', TimeReason: 'Noon Standard time' },
    { Type: 'HS', FromYear: 172, BDateCode: '6.17', NameEn: 'Martyrdom of the B&aacute;b', Time: '1200S', TimeReason: 'Noon Standard time' },

    { Type: 'HS', UntilYear: 171, BDateCode: '12.5', NameEn: 'Birth of the B&aacute;b' },
    { Type: 'HS', UntilYear: 171, BDateCode: '13.9', NameEn: "Birth of Bah&aacute;'u'll&aacute;h" },
    { Type: 'HS', FromYear: 172, Special: 'THB.1', NameEn: 'Birth of the B&aacute;b' },
    { Type: 'HS', FromYear: 172, Special: 'THB.2', NameEn: "Birth of Bah&aacute;'u'll&aacute;h" },

    { Type: 'HO', BDateCode: '14.4', NameEn: 'Day of the Covenant' },
    { Type: 'HO', BDateCode: '14.6', NameEn: "Ascension of `Abdu'l-Bah&aacute;", Time: '0100S', TimeReason: '1 am Standard time' },

    { Type: 'OtherRange', BDateCode: '2.13', BDateCodeTo: '3.5', NameEn: 'Festival of Ridv&aacute;n' },
    { Type: 'OtherRange', Special: 'AYYAM.Intercalary', NameAr: 'Ayyám-i-Há', NameEn: 'Intercalary Days' },

    { Type: 'OtherDay', BDateCode: '2.13', NameEn: 'Annual Meeting and Election' },
    { Type: 'OtherDay', Special: 'JAN1', NameEn: 'Start of Gregorian Year ' }
    ];
  };

  // date utilities //////////////////////////////////////////
  function splitToBMonthDay(code) {
    // split code to {m: d:}
    var split = code.split('.');
    return { m: +split[0], d: +split[1] };
  }

  function AtTime(timeCode) {
    // show time
    if (typeof (timeCode) == 'undefined') return '';
    // 24hr:  return +timeCode.substr(0,2) + ':' + timeCode.substr(2,2);
    return new Date(2000, 0, 1, +timeCode.substr(0, 2), +timeCode.substr(2, 2)).showTime();
  }

  function ShortBadi(bMonthDay) {
    // show this date
    return _bMonthNames[bMonthDay.m] + ' ' + bMonthDay.d;
  }

  function ShortGregDate(fullDate) {
    // show gregorian date
    if (!fullDate || isNaN(fullDate)) {
      debugger;
      return '?2?';
    }
    var month = fullDate.getMonth();
    var day = fullDate.getDate();
    var eveDate = fullDate.getEveDate();
    var eveMonth = eveDate.getMonth();
    var monthName = _gMonthNames[eveMonth];
    var result;
    if (eveMonth != month) {
      // Jul 31/Aug 1
      result = (monthName + ' ' + eveDate.getDate() + '/').eveInfo() + _gMonthNames[month] + ' ' + day;
    } else {
      // Jul 12/13
      result = monthName + ' ' + (eveDate.getDate() + '/').eveInfo() + day;
    }
    return result;
  }

  function ShortGregDateNoEve(fullDate) {
    // show gregorian date
    if (!fullDate || isNaN(fullDate)) {
      debugger;
      return '?2?';
    }
    var month = fullDate.getMonth();
    var day = fullDate.getDate();
    var monthName = _gMonthNames[month];
    var result = fullDate.showTime() + ' ' + fullDate.getDayOfWeek() + ', ' + monthName + ' ' + day + ', ' + fullDate.getFullYear();
    return result;
  }

  var makeBMonthDay = function (month, day) {
    // combine numbers into object
    return { m: +month, d: +day };
  }

  var getGDateYBDate = function (bYear, bMonthDay) {
    if (!bMonthDay || !bMonthDay.d) {
      debugger;
      return '?3?';
    }
    return getGDateYMD(bYear, bMonthDay.m, bMonthDay.d);
  }

  var getGDateYMD = function (bYear, bMonth, bDay) {
    // convert bDate to gDate
    if (bMonth < 0 || bMonth > 19 || typeof bMonth == 'undefined') {
      throw 'invalid Badi date';
    }
    if (bDay < 1 || bDay > 19 || !bDay) {
      throw 'invalid Badi date';
    }
    var gYear = bYear + 1843;
    var nawRuz = new Date(gYear, 2, 21 + (_nawRuzOffsetFrom21[bYear] || 0));
    var answer = new Date(nawRuz);
    answer.setDate(answer.getDate() + (bMonth - 1) * 19 + (bDay - 1));

    if (bMonth == 0 || bMonth == 19) {
      var nextNawRuz = new Date(gYear + 1, 2, 21 + (_nawRuzOffsetFrom21[bYear + 1] || 0))
      var startOfAla = new Date(nextNawRuz.getTime());
      startOfAla.setDate(startOfAla.getDate() - 19);
      if (bMonth == 19) {
        answer = startOfAla;
        answer.setDate(answer.getDate() + (bDay - 1));
      }
      else {
        var firstAyyamiHa = new Date(getGDateYMD(bYear, 18, 19));
        firstAyyamiHa.setDate(firstAyyamiHa.getDate() + 1);
        var lastAyyamiHa = new Date(getGDateYMD(bYear, 19, 1));
        lastAyyamiHa.setDate(lastAyyamiHa.getDate() - 1);

        var numDaysInAyyamiHa = daysBetween(firstAyyamiHa, lastAyyamiHa);
        if (bDay > numDaysInAyyamiHa) {
          throw 'invalid Badi date';
        }
        answer = firstAyyamiHa;
        answer.setDate(answer.getDate() + (bDay - 1));
      }
    }
    return answer;
  }

  var getBDate = function (d) {
    var afterNawRuz = d.isAfterNawRuz();
    var afterSunset = 0;

    if (typeof SunCalc != 'undefined' && _locationLat != 0) {
      var pmSunset = new Date(d);
      pmSunset.setHours(12);
      pmSunset = SunCalc.getTimes(pmSunset, _locationLat, _locationLong).sunset;
      if (d.getTime() > pmSunset.getTime()) {
        afterSunset = 1;
      }
    }
    else {
      console.log('unknown sunset');
    }

    var year = d.getBadiYear();
    var days, month, day;
    if (afterNawRuz) {
      var nawRuz = d.getNawRuz();
      days = d.dayOfYear() - nawRuz.dayOfYear() + afterSunset;
      month = Math.floor(days / 19) + 1;
      day = days % 19;
      if (day == 0) {
        day = 19;
        month--;
      }
    }
    else { // before
      var lastDec31 = new Date(d.getFullYear(), 0, 0, 12);
      var lastNawRuz = lastDec31.getNawRuz();
      days = d.dayOfYear() + (lastDec31.dayOfYear() - lastNawRuz.dayOfYear()) + afterSunset;
      month = Math.floor(days / 19) + 1;
      day = days % 19;
      if (day == 0) {
        day = 19;
        month--;
      }
      if (month >= 19) {
        var lastAyyamiHa = new Date(getGDateYMD(year, 19, 1));
        lastAyyamiHa.setDate(lastAyyamiHa.getDate() - 1);

        if (d.dayOfYear() > lastAyyamiHa.dayOfYear()) {
          month = 19;
          day = d.dayOfYear() - lastAyyamiHa.dayOfYear() + afterSunset;
        }
        else {
          month = 0;
        }
      }
    }

    return { y: year, m: month, d: day, eve: afterSunset == 1 };
  }


  var daysBetween = function (d1, d2) {
    return 1 + Math.round(Math.abs((d1.getTime() - d2.getTime()) / _msInDay))
  }

  // Badi months - 0=Ayyam-i-Há
  var _bMonthNames = "Ayyám-i-Há,Bahá,Jalál,Jamál,`Azamat,Núr,Rahmat,Kalimát,Kamál,Asmá’,`Izzat,Mashíyyat,`Ilm,Qudrat,Qawl,Masá'il,Sharaf,Sultán,Mulk,`Alá’".split(',');


  // =============================================================  
  // table of Naw Ruz dates
  var _nawRuzOffsetFrom21 = {
    // by default and historically, on March 21. If not, year is listed here with the offset... 173 is March 20
    // can be 0, -1, -2? and will never change by more than 1 day between years
    173:-1,
    174:-1,
    175:0,
    176:0,
    177:-1,
    178:-1,
    179:0,
    180:0,
    181:-1,
    182:-1,
    183:0,
    184:0,
    185:-1,
    186:-1,
    187:-1,
    188:0,
    189:-1,
    190:-1,
    191:-1,
    192:0,
    193:-1,
    194:-1,
    195:-1,
    196:0,
    197:-1,
    198:-1,
    199:-1,
    200:0,
    201:-1,
    202:-1,
    203:-1,
    204:0,
    205:-1,
    206:-1,
    207:-1,
    208:0,
    209:-1,
    210:-1,
    211:-1,
    212:0,
    213:-1,
    214:-1,
    215:-1,
    216:-1,
    217:-1,
    218:-1,
    219:-1,
    220:-1,
    221:-1,
    222:-1  // implied on the "Baha'i Dates 172 to 221 B.E." document, as Ayyam-i-Há is shown to end on Feb 28
  };
  // tables of vernal equinox dates seem to indicate that it will be March 20 for the next 30+ years
  //for (var y = 174; y < 200; y++) { _nawRuzOffsetFrom21[y] = -1; }
  // not known yet... testing only. Never more than 1 day difference between years
  //_nawRuzOffsetFrom21[175] = -2;
  //_nawRuzOffsetFrom21[177] = 0;


  // =============================================================  
  // table of Twin Holy birthday dates
  var _twinHolyBirthdays = {
    // first of the two days, in Badi date code
    // extracted from "Bahá’í Dates 172 to 221 B.E."
    172: '13.10',
    173: '12.18',
    174: '12.7',
    175: '13.6',
    176: '12.14',
    177: '12.4',
    178: '13.4',
    179: '12.11',
    180: '12.1',
    181: '12.19',
    182: '12.8',
    183: '13.7',
    184: '12.15',
    185: '12.5',
    186: '13.5',
    187: '12.14',
    188: '12.2',
    189: '13.2',
    190: '12.10',
    191: '13.10',
    192: '12.17',
    193: '12.6',
    194: '13.6',
    195: '12.15',
    196: '12.4',
    197: '13.4',
    198: '12.12',
    199: '12.1',
    200: '12.19',
    201: '12.8',
    202: '13.8',
    203: '12.16',
    204: '12.5',
    205: '13.5',
    206: '12.14',
    207: '12.3',
    208: '13.2',
    209: '12.10',
    210: '13.9',
    211: '12.18',
    212: '12.6',
    213: '13.6',
    214: '12.15',
    215: '12.4',
    216: '13.4',
    217: '12.11',
    218: '11.19',
    219: '12.19',
    220: '12.9',
    221: '13.8'
  };
  var _lastYearDefined = 221;
  var _lastTwinHolyBirthdayDefined = 221;

  // =============================================================  

  function includeJs(jsFilePath) {
    var js = document.createElement("script");
    js.type = "text/javascript";
    js.src = jsFilePath;
    document.body.appendChild(js);
  }

  var getNawRuz = function (gYear) {
    // get NawRuz for this gregorian year
    var bYear = gYear - 1843;
    var nawRuz = new Date(gYear,
      2,
      20 + (_nawRuzOffsetFrom21[bYear] || 0),
      18, // default to 6:30pm
      30);

    if (typeof SunCalc != 'undefined' && _locationLat != 0) {
      var eveSunset = new Date(nawRuz);
      nawRuz = SunCalc.getTimes(eveSunset, _locationLat, _locationLong).sunset;
    }
    return nawRuz;
  }


  // =============================================================  
  // =============================================================  
  function LoadSunCalc(callback) {
    if (typeof SunCalc === 'undefined') {
      var path = _scriptPath;
      var parts = path.split('/');
      parts[parts.length - 1] = 'suncalc.js';
      var url = parts.join('/');

      if (callback) {
        afterSunCalcLoaded = callback;
      }

      includeJs(url);
    } else {
      if (callback) {
        callback();
      }
    }
  }

  var sunCalcLoaded = function () {
    if (typeof (afterSunCalcLoaded) === 'function') {
      afterSunCalcLoaded();
    }
  };

  function AddSunsetTimes() {
    LoadSunCalc(AddSunsetTimes2);
  }

  function AddSunsetTimes2() {
    // using https://github.com/mourner/suncalc

    $('.Sunset').each(function (i, dom) {
      var el = $(dom);
      var d = el.data('gdate');
      if (d) {
        if (_locationLat == 0 || _locationLong == 0) {
          el.text('');
          return;
        }
        var date = new Date(d);
        date.setHours(12);
        var times = SunCalc.getTimes(date, _locationLat, _locationLong);
        el.html(times.sunset.showTime());
      }
    });
    $('.Sunrise').each(function (i, dom) {
      var el = $(dom);
      var d = el.data('gdate');
      if (d) {
        if (_locationLat == 0 || _locationLong == 0) {
          el.text('');
          return;
        }
        var date = new Date(d);
        date.setHours(12);
        var times = SunCalc.getTimes(date, _locationLat, _locationLong);
        el.html(times.sunrise.showTime());
      }
    });

    var startTime = $('#StartTime').val();
    var feastHour = startTime.slice(0, 2);
    var feastMin = startTime.slice(-2);

    $('td.ForFeast').each(function (i, dom) {
      var el = $(dom);
      var d = el.data('gdate');
      if (d) {
        if (_locationLat == 0 || _locationLong == 0) {
          el.text('');
          return;
        }
        var date = new Date(d);
        date.setHours(feastHour);
        date.setMinutes(feastMin);
        var times = SunCalc.getTimes(date, _locationLat, _locationLong);
        if (times.sunset.getTime() < date.getTime()) {
          date.setHours(date.getHours() - 24);
          el.html(ShortGregDateNoEve(date) + ' (eve)');
        }
        else {
          el.html(ShortGregDateNoEve(date));
        }
      }
    });

    $('td.ForStartTime').each(function (i, dom) {
      var el = $(dom);
      var d = el.data('gdate');
      var targetTime = '' + el.data('time');
      if (d && targetTime) {
        if (_locationLat == 0 || _locationLong == 0) {
          el.text('');
          return;
        }

        var date = new Date(d);
        if (targetTime == 'SS+2') {
          date.setHours(-12);
          var sunset2 = SunCalc.getTimes(date, _locationLat, _locationLong).sunset;
          sunset2.setHours(sunset2.getHours() + 2);
          // about 2 hours after sunset
          var minutes = sunset2.getMinutes();
          minutes = minutes > 30 ? 30 : 0; // start 1/2 hour before
          sunset2.setMinutes(minutes);
          el.html(ShortGregDateNoEve(sunset2) + ' (eve)' + ' <span class=help></span>');
        }
        else {
          var isToday = el.hasClass('Today');

          var adjustDTtoST = 0;
          if (targetTime.slice(-1) == 'S') {
            targetTime = targetTime.slice(0, 4);

            adjustDTtoST = date.inStandardTime() ? 0 : 1;
          }

          var asterisk = !isToday && targetTime != $('#StartTime').val() ? ' <span class=help></span>' : '';
          var timeHour = +targetTime.slice(0, 2);
          var timeMin = targetTime.slice(-2);
          date.setHours(timeHour + adjustDTtoST);
          date.setMinutes(timeMin);

          var times = SunCalc.getTimes(date, _locationLat, _locationLong);
          if (times.sunset.getTime() < date.getTime()) {
            // after sunset
            date.setHours(date.getHours() - 24);
            el.html((isToday ? 'Time now: ' : '') + ShortGregDateNoEve(date) + ' (eve)' + asterisk);
          }
          else {
            el.html((isToday ? 'Time now: ' : '') + ShortGregDateNoEve(date) + asterisk);
          }
        }

      }
    });

  }

  function showLocation() {
    LoadSunCalc();

    if (!_locationLat || !_locationLong) {
      return;
    }

    var show = function (name) {
      $('#latLongName').text(name);
    }
    show('');

    var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + _locationLat + ',' + _locationLong
    $.ajax({
      url: url,
      dataType: 'json',
      cache: true,
      success: function (data) {
        if (data.status === 'OK') {
          var components = data.results[0].address_components;
          for (var i = 0; i < components.length; i++) {
            var component = components[i];
            //console.log(component);
            if ($.inArray('political', component.types) != -1) { //$.inArray('political', component.types)!=-1 && 
              show(component.short_name);
              break;
            }
          }
        }
      }
    });
  }



  // hack to learn path to this file
  var _scriptEls = document.getElementsByTagName('script');
  var _scriptPath = _scriptEls[_scriptEls.length - 1].src;


  // make these available to the browser
  return {
    startup: startup,
    getNawRuz: getNawRuz,
    dateInfos: _dateInfos,
    getGDate: getGDateYMD,
    getBDate: getBDate,
    _suncalcLoaded: sunCalcLoaded,
    _bMonths: _bMonthNames,
    _nawRuzOffsetFrom21: _nawRuzOffsetFrom21
  };
}

var holyDays = new HolyDays();
jQuery(document).ready(function () {
  holyDays.startup();
});






// prototypes for holyDays
Date.prototype.getNawRuz = function () {
  return holyDays.getNawRuz(this.getFullYear());
}
Date.prototype.isAfterNawRuz = function () {
  return this.getTime() > holyDays.getNawRuz(this.getFullYear()).getTime();
}
Date.prototype.getBadiYear = function () {
  return this.getFullYear() - 1843 - (this.isAfterNawRuz() ? 0 : 1);
}


// base date info /////////////////////////////////////////
//var _gMonthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
//var _dayNamesLong = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var _gMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var _dayNamesShortGreg = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
Date.prototype.getMonthName = function () {
  return _gMonthNames[this.getMonth()];
}
Date.prototype.getDayOfWeek = function () {
  return _dayNamesShortGreg[this.getDay()];
}
Date.prototype.getDayNames = function () {
  return (this.getEveDate().getDayOfWeek() + '/').eveInfo() + this.getDayOfWeek();
}
Date.prototype.inStandardTime = function () {
  var jan = new Date(this.getFullYear(), 0, 1);
  return jan.getTimezoneOffset() == this.getTimezoneOffset();
}
Date.prototype.dayOfYear = function () {
  var j1 = new Date(this);
  j1.setMonth(0, 0);
  return Math.round((this - j1) / 8.64e7);
}
Date.prototype.showTime = function () {
  //var time = ('0' + this.getHours()).slice(-2) + ':' + ('0' + this.getMinutes()).slice(-2);
  var pm = this.getHours() >= 12;
  var hours = this.getHours() > 12 ? this.getHours() - 12 : this.getHours();
  var minutes = this.getMinutes();
  var time = hours + ':' + ('0' + minutes).slice(-2) + (pm ? ' pm' : ' am');
  if (hours == 12 && minutes == 0) {
    time = '12:00 noon';
  }
  return '<span title="' + this + '">' + time + '</span>';
  //return time;
}
Date.prototype.getEveDate = function () {
  var x = new Date(this.getTime());
  x.setDate(x.getDate() - 1);
  return x;
}
Date.prototype.getTimezoneName = function(){
  // very simple method
  
}

// other
String.prototype.eveInfo = function () {
  return '<span class=eveInfo>' + this + '</span>';
}

