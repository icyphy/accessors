// To run, start the test server (see /web/hosts/browser/test/README.txt) and
// point your browser to http://localhost:8088/hosts/browser/test/services/testStockTick.html

var expect = chai.expect;

// Create a fake server to respond to the stock tick requests.  
// See http://sinonjs.org/
var server;

before(function () {
        server = sinon.fakeServer.create();
        server.autoRespond = true;
});

after(function () {
    server.restore();
});

describe('Test StockTick results', function () {
        it("Should GET a stock quote", function(done) {
                var fakeData =         {"query":{"count":1,"created":"2016-04-03T15:42:02Z","lang":"en-US","results":{"quote":{"symbol":"YHOO","Ask":"36.50","AverageDailyVolume":"17531800","Bid":"36.41","AskRealtime":null,"BidRealtime":null,"BookValue":"30.78","Change_PercentChange":"-0.33 - -0.90%","Change":"-0.33","Commission":null,"Currency":"USD","ChangeRealtime":null,"AfterHoursChangeRealtime":null,"DividendShare":null,"LastTradeDate":"4/1/2016","TradeDate":null,"EarningsShare":"-4.64","ErrorIndicationreturnedforsymbolchangedinvalid":null,"EPSEstimateCurrentYear":"0.53","EPSEstimateNextYear":"0.60","EPSEstimateNextQuarter":"0.12","DaysLow":"36.31","DaysHigh":"36.88","YearLow":"26.15","YearHigh":"46.17","HoldingsGainPercent":null,"AnnualizedGain":null,"HoldingsGain":null,"HoldingsGainPercentRealtime":null,"HoldingsGainRealtime":null,"MoreInfo":null,"OrderBookRealtime":null,"MarketCapitalization":"34.42B","MarketCapRealtime":null,"EBITDA":"474.68M","ChangeFromYearLow":"10.33","PercentChangeFromYearLow":"+39.50%","LastTradeRealtimeWithTime":null,"ChangePercentRealtime":null,"ChangeFromYearHigh":"-9.69","PercebtChangeFromYearHigh":"-20.99%","LastTradeWithTime":"4:00pm - <b>36.48</b>","LastTradePriceOnly":"36.48","HighLimit":null,"LowLimit":null,"DaysRange":"36.31 - 36.88","DaysRangeRealtime":null,"FiftydayMovingAverage":"33.06","TwoHundreddayMovingAverage":"32.18","ChangeFromTwoHundreddayMovingAverage":"4.30","PercentChangeFromTwoHundreddayMovingAverage":"+13.36%","ChangeFromFiftydayMovingAverage":"3.42","PercentChangeFromFiftydayMovingAverage":"+10.33%","Name":"Yahoo! Inc.","Notes":null,"Open":"36.45","PreviousClose":"36.81","PricePaid":null,"ChangeinPercent":"-0.90%","PriceSales":"6.99","PriceBook":"1.20","ExDividendDate":null,"PERatio":null,"DividendPayDate":null,"PERatioRealtime":null,"PEGRatio":"-14.83","PriceEPSEstimateCurrentYear":"68.83","PriceEPSEstimateNextYear":"60.80","Symbol":"YHOO","SharesOwned":null,"ShortRatio":"3.32","LastTradeTime":"4:00pm","TickerTrend":null,"OneyrTargetPrice":"37.88","Volume":"13656220","HoldingsValue":null,"HoldingsValueRealtime":null,"YearRange":"26.15 - 46.17","DaysValueChange":null,"DaysValueChangeRealtime":null,"StockExchange":"NMS","DividendYield":null,"PercentChange":"-0.90%"}}}};
                
                // Set up the fake response
                server.respondWith( [
                         200, 
                         { "Content-Type": "application/json" },
                         JSON.stringify(fakeData)
                ]);        
                
                reactIfExecutable('StockTick');
                
                // Wait a bit for request to complete.
                setTimeout(function() {
                        expect(document.getElementById("StockTick.response").innerHTML).to.equal(JSON.stringify(fakeData));
                        done();
                }, 200);
        });
        
});


