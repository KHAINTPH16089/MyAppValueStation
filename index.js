document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".btn-chart");

    buttons.forEach((button) => {
        button.addEventListener("click", function () {
            6;
            // Xóa class 'active' khỏi tất cả các nút
            buttons.forEach((btn) => btn.classList.remove("active"));
            console.log(button);

            // Thêm class 'active' vào nút được nhấn
            this.classList.add("active");
        });
    });
});

var maTram = localStorage.getItem("TRAM");
function changeQRcode() {
    document.getElementById("ScanQR").classList.remove("hidden");
    document.getElementById("homePage").classList.add("hidden");
    localStorage.setItem("TRAM", "");
}
var TRAM = "";
function truyCap() {
    localStorage.setItem("TRAM", TRAM);
    maTram = localStorage.getItem("TRAM");
    document.getElementById("ScanQR").classList.add("hidden");
    document.getElementById("homePage").classList.remove("hidden");
    getDataMonitoring();
}

async function getDataMonitoring() {
    const data = await getDM(
        "LOG_ZONE_MONITORING",
        "WORKSTATION_ID='" + maTram + "'"
    );
    const dataChart = await getDataChart('NGAY','','', 'RA-RT-RH-RP', '091850');
    if(dataChart != []){
        createChartData(dataChart, 'RA')
    }
    
    changeDataHomePage(data.data);
    setInterval(async () => {
        const data = await getDM(
            "LOG_ZONE_MONITORING",
            "WORKSTATION_ID='" + maTram + "'"
        );
        changeDataHomePage(data.data);
    }, 10000);
}

function changeDataHomePage(data) {
    console.log(data);
    const dateTime = formatDateTime(data[0].LAST_VALUE_DATE)
    document.getElementById("lateDateTime").textContent = dateTime;
    for (let i = 0; i < data.length; i++) {
        if (data[i].PROPERTY_INDEX == "RT") {
            document.getElementById("RT").textContent = data[i].LAST_VALUE / 10 + "°C";
            updateProgressBar("temp-bar", -10, 50, data[i].LAST_VALUE / 10, "°C");
        } else if (data[i].PROPERTY_INDEX == "RD") {
            if (data[i].LAST_VALUE == 2) {
                document.getElementById("status").style.background = "green";
            }
        } else if (data[i].PROPERTY_INDEX == "RH") {
            document.getElementById("RH").textContent = data[i].LAST_VALUE / 10 + "%";
        } else if (data[i].PROPERTY_INDEX == "RP") {
            document.getElementById("RP").textContent =data[i].LAST_VALUE / 10 + "hPa";
        } else if (data[i].PROPERTY_INDEX == "RA") {
            const color = getColor(data[i].LAST_VALUE / 10);
            changeColorAndText(color, color, data[i].LAST_VALUE / 10);
            updateProgressBar("rain-bar", -500, 500, (data[i].LAST_VALUE / 10), "mm");
        }
    }
}

function updateProgressBar(id, min, max, temp, Unit) {
    var minTemp = min;
    var maxTemp = max;
    var percentage = ((temp - minTemp) / (maxTemp - minTemp)) * 100;
    var progressBar = document.getElementById(id);
    if (percentage >= 0 && percentage <= 100) {
        progressBar.style.height = percentage + "%";
        progressBar.setAttribute("aria-valuenow", percentage);
        progressBar.innerHTML = temp + Unit;
    } else {
        console.log("Temperature out of range");
    }
}


function getColor(value) {
    if (value > 400) {
        return "#a00ba0";
    } else if (value >= 300 && value <= 400) {
        return "#9f55e4";
    } else if (value >= 200 && value < 300) {
        return "#009999";
    } else if (value >= 150 && value < 200) {
        return "#00ffff";
    } else if (value >= 100 && value < 150) {
        return "#006600";
    } else if (value >= 50 && value < 100) {
        return "#66cc00";
    } else if (value >= 20 && value < 50) {
        return "#b2ff66";
    } else if (value >= 10 && value < 20) {
        return "#0084ff";
    } else if (value >= 5 && value < 10) {
        return "#7fc1ff";
    } else if (value >= 0 && value < 5) {
        return "#bfe0ff";
    } else if (value >= -5 && value < 0) {
        return "#ffffa6";
    } else if (value >= -10 && value < -5) {
        return "#ffff00";
    } else if (value >= -20 && value < -10) {
        return "#ffb266";
    } else if (value >= -50 && value < -20) {
        return "#ff8000";
    } else if (value >= -100 && value < -50) {
        return "#994c00";
    } else if (value >= -150 && value < -100) {
        return "#ff9999";
    } else if (value >= -200 && value < -150) {
        return "#ff3333";
    } else if (value < -200) {
        return "#660000";
    } else {
        return "value out of range";
    }
}

var user_id = "admin";
// var session = '32085528-628c-449b-996f-a240ad606d1d';
var session = "7b504acc-988a-437a-890f-389765305b47";

if (maTram == "" || maTram == null) {
    document.getElementById("ScanQR").classList.remove("hidden");
    document.getElementById("homePage").classList.add("hidden");
} else {
    getDataMonitoring();
    document.getElementById("ScanQR").classList.add("hidden");
    document.getElementById("homePage").classList.remove("hidden");
}
function formatDateTime(date) {
    const now = new Date(date);

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const formattedDatetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDatetime
}
var checkCam = true;
function startCam(){
    var scanner = new Instascan.Scanner({
        video: document.getElementById("preview"),
    });
    if(checkCam == true){
        // var scanner = new Instascan.Scanner({
        //     video: document.getElementById("preview"),
        // });
        let cameras = [];
        let currentCameraIndex = 0;
        // Lấy danh sách camera

        Instascan.Camera.getCameras().then(function (availableCameras) {
            cameras = availableCameras;
            if (cameras.length > 0) {
                scanner.start(cameras[currentCameraIndex]);
            } else {
                console.error('No cameras found.');
                document.getElementById('result').innerText = 'No cameras found.';
            }
        }).catch(function (e) {
            console.error(e);
            document.getElementById('result').innerText = 'Error accessing camera.';
        });
        document.getElementById('switch-btn').classList.remove("d-none")
        // Nút chuyển camera
        document.getElementById('switch-btn').addEventListener('click', function () {
            if (cameras.length > 1) {
                currentCameraIndex = (currentCameraIndex + 1) % cameras.length;
                scanner.start(cameras[currentCameraIndex]);
            }
        });
        scanner.addListener("scan", async function (content) {
            const data = await getDM(
                "DM_WORKSTATION",
                "WORKSTATION_ID='" + content + "'"
            );
            console.log(data);
            
            if (data.data != []) {
                document.getElementById("truycap").disabled = false;
                TRAM = content;
                const value = data.data;
                document.getElementById("result").innerText = `Trạm: ${content + " " + value[0].WORKSTATION_NAME}`;
                checkCam = true;
                document.getElementById('switch-btn').classList.add("d-none")
                scanner.stop().then(() => {
                    console.log('Quét đã dừng.');
                    //document.getElementById('result').innerText = 'Quét đã dừng.';
                    
                    // Dừng video và làm trống video
                    let videoElement = document.getElementById('preview');
                    videoElement.srcObject = null;
                    isScanning = false; // Đánh dấu trạng thái dừng quét
                }).catch(err => {
                    console.error('Lỗi khi dừng quét:', err);
                });
                const button = document.getElementById("start");
                button.textContent = "Bắt đầu quét";
                button.style.background = "#0d6efd";
                button.style.border = 'none'
                toastr.success("Quét QR thành công");
            }
        });
        checkCam = false
        const button = document.getElementById("start");
        button.textContent = "Dừng Quét";
        button.style.background = "#ef5a2a";
        button.style.border = 'none'
    } else {
        checkCam = true;
        document.getElementById('switch-btn').classList.add("d-none")
        scanner.stop().then(() => {
            console.log('Quét đã dừng.');
            //document.getElementById('result').innerText = 'Quét đã dừng.';
            
            // Dừng video và làm trống video
            let videoElement = document.getElementById('preview');
            videoElement.srcObject = null;
            isScanning = false; // Đánh dấu trạng thái dừng quét
        }).catch(err => {
            console.error('Lỗi khi dừng quét:', err);
        });
        const button = document.getElementById("start");
        button.textContent = "Bắt đầu quét";
        button.style.background = "#0d6efd";
        button.style.border = 'none'
    }
}

function getDM(table_name, c) {
    const d = {
        Uid: user_id,
        Sid: session,
        tablename: table_name,
        c: c,
        other: "",
        cmd: "",
    };

    const Url = "https://DEV.HOMEOS.vn/service/service.svc/";

    return new Promise((resolve, reject) => {
        $.ajax({
            url: "https://namdinh.homeos.vn/Service/Service.svc/getDm?callback=?",
            type: "GET",
            dataType: "jsonp",
            data: d,
            contentType: "application/json; charset=utf-8",
            success: function (msg) {
                try {
                    let state = JSON.parse(msg);
                    console.log(state);
                    
                    resolve(state); // Trả về dữ liệu khi thành công
                } catch (error) {
                    reject(error); // Bắt lỗi nếu JSON parse thất bại
                }
            },
            complete: function (data) {
                // Có thể thêm xử lý khi request hoàn thành ở đây nếu cần
            },
            error: function (e, t, x) {
                HomeOS.Service.SetActionControl(true);
                HomeOS.Service.ShowLabel("Lỗi dữ liệu");
                reject(e); // Trả về lỗi nếu thất bại
            },
        });
    });
}

async function clickGetData(type){
    if(type == 'NGAY'){
        const dataChart = await getDataChart('NGAY','','', 'RA---', maTram);
        if(dataChart != []){
            createChartData(dataChart, 'RA')
        }
    } else if(type == 'TUAN'){
        const dataChart = await getDataChart('TUAN','','', 'RA---', maTram);
        if(dataChart != []){
            createChartData(dataChart, 'RA')
        }
    } else if(type == 'THANG'){
        const dataChart = await getDataChart('THANG','','', 'RA---', maTram);
        if(dataChart != []){
            createChartData(dataChart, 'RA')
        }
    } else if(type == 'NAM'){
        const dataChart = await getDataChart('NAM','2024-01-01 16$50$08','2024-12-30 16$50$08', 'RA---', maTram);
        if(dataChart != []){
            createChartData(dataChart, 'RA')
        }
    }
    
}

function getDataChart(typeTime, start, end, type, zone) {

    const Url = "https://DEV.HOMEOS.vn/service/service.svc/";

    return new Promise((resolve, reject) => {
        $.ajax({
            url: "https://namdinh.homeos.vn/Service/Service.svc/ApiServicePublic/" + "GetDataFilterLogzone" + "/" + "TYPE_TIME='"+typeTime+"',START_DATE='"+start+"',END_DATE='"+end+"',TYPE_VALUE='"+type+"',ZONE_ADDRESS='"+zone+"'",
            type: "GET",
            dataType: "jsonp",
            contentType: "application/json; charset=utf-8",
            success: function (msg) {
                try {
                    let state = JSON.parse(msg);
                    resolve(state); // Trả về dữ liệu khi thành công
                } catch (error) {
                    reject(error); // Bắt lỗi nếu JSON parse thất bại
                }
            },
            complete: function (data) {
                // Có thể thêm xử lý khi request hoàn thành ở đây nếu cần
            },
            error: function (e, t, x) {
                HomeOS.Service.SetActionControl(true);
                HomeOS.Service.ShowLabel("Lỗi dữ liệu");
                reject(e); // Trả về lỗi nếu thất bại
            },
        });
    });
}

function changeColorAndText(fillColor, strokeColor, newText) {
    const path = document.querySelector("#mySvg path");
    const text = document.querySelector("#mySvg text");

    // Change the path colors
    path.setAttribute("fill", fillColor);
    path.setAttribute("stroke", strokeColor);

    // Update the text content
    text.textContent = newText + "mm";
}
var ctx = document.getElementById("lineBarChart");

// Tạo biểu đồ
ctx.getContext("2d");
var lineBarChart = new Chart(ctx, {
    type: "bar", // Chọn loại biểu đồ chính là bar
    data: {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [
            {
                type: "bar", // Chọn kiểu bar cho dataset này
                label: "Lượng bán hàng",
                data: [30, 50, 40, 60, 70, 45, 80],
                backgroundColor: "rgba(75, 192, 192, 0.5)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
            {
                type: "line", // Chọn kiểu line cho dataset này
                label: "Doanh thu",
                data: [300, 400, 350, 450, 500, 400, 550],
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                fill: false, // Không tô nền dưới đường
                tension: 0.3, // Tạo độ cong cho đường
                borderWidth: 2,
            },
        ],
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true, // Đảm bảo trục Y bắt đầu từ 0
            },
        },
    },
});

createChartData = function(data, type){
    if(lineBarChart != null && type == "RA"){
        lineBarChart.destroy();
    }
    var RA = ctx.getContext('2d');
    let newDataRA = [];
    let newlabelRA = [];
    $.each(data, function (i, item) {
        if(item.AverageValue != 0){
            if(item.ZONE_PROPERTY == 'RA'){
                newlabelRA.push(item.Label);
                newDataRA.push(item.AverageValue)
            }
            
        }
    })
    
    
    var dataSetRA = [{
        type: "bar", // Chọn kiểu bar cho dataset này
        label: "Lượng mưa",
        data: newDataRA,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
    }]
    lineBarChart = new Chart(RA, createChart("bar", newlabelRA, newDataRA, "mm", "Lượng mưa", dataSetRA));
}

createChart = function(type, Label, Data, Unit, LabelData, dataSet){
    return {
        type: type, // Loại biểu đồ
        data: {
            labels: Label,
            datasets: dataSet
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, // Không giữ tỷ lệ khung hình
            responsive: true,
            scales: {
                y: {  // Sử dụng 'y' thay vì 'yAxes'
                    beginAtZero: true,
                    ticks: {
                        callback: function(value, index, values) {
                            return value + ' '+Unit;  // Thêm đơn vị Volts vào mỗi giá trị trục y
                        }
                    }
                }
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        let label = data.datasets[tooltipItem.datasetIndex].label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += tooltipItem.yLabel + ' '+Unit;  // Thêm đơn vị Volts vào tooltip
                        return label;
                    }
                }
            }
        }
    }
}