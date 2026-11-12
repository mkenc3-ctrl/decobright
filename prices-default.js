// 기본 가격표 (데코브라이트 견적프로그램 최신 기준, 공급가액). 가격표 관리 화면에서 고친 값은 기기에 따로 저장되어 이 값 위에 덮어씀
  window.DECO_PKGS0 = [
    {id:"none", name:"선택 안함", price:0, desc:"패키지 없이 개별 항목으로만 견적", f:{inN:0,tvN:0,cove:0,curtain:false,fan:false}},
    {id:"p1", name:"우물 패키지", price:790000, desc:"우물 한방라운드 / 우물 내부 다운라이트 8개", f:{inN:8,tvN:0,cove:0,curtain:false,fan:false}},
    {id:"p2", name:"거실 간접등 패키지", price:1100000, desc:"TV·쇼파 다운라이트 6개 / 우물 내부 다운라이트 8개 / 거실 커튼박스 T5 간접등 / 우물등박스 T5 간접등", f:{inN:8,tvN:6,cove:1,curtain:true,fan:false}},
    {id:"p3", name:"거실 실링팬 패키지", price:1650000, desc:"실링팬 / 우물 다운라이트 12개 / 우물등박스 T5 간접등 / 거실 커튼박스 T5 간접등 / 현관 간접 센서등 / TV·쇼파 다운라이트 6개 (도배 별도)", f:{inN:12,tvN:6,cove:1,curtain:true,fan:true}},
    {id:"p4", name:"풀 패키지", price:1900000, desc:"실링팬 / 우물등박스 T5 간접등(두줄) / 거실 커튼박스 T5 간접등 / 우물 다운라이트 12개 / TV·쇼파 다운라이트 6개 / 화장실 2곳 센서등 / 현관 센서등 (도배 별도)", f:{inN:12,tvN:6,cove:2,curtain:true,fan:true}},
    {id:"p5", name:"VIP 패키지", price:2350000, desc:"실링팬 / 우물등박스 T5 간접등(두줄) / 거실 커튼박스 T5 간접등 / 우물 다운라이트 12개 / TV·쇼파 다운라이트 6개 / 냉장고장 다운라이트 2개 / 화장실 2곳 센서등 / 현관 간접 센서등 / 안방·작은방 2곳 커튼박스 T5 간접등 (도배 별도)", f:{inN:12,tvN:6,cove:2,curtain:true,fan:true}}
  ];
  window.DECO_ITEMS0 = [
    {id:"i1", name:"다운라이트 3인치", price:30000, unit:"개당"},
    {id:"i2", name:"다운라이트 2인치(호른)", price:40000, unit:"개당"},
    {id:"i3", name:"커튼박스 T5 간접등", price:100000, unit:"개소"},
    {id:"i4", name:"우물등박스 간접등 두줄", price:250000, unit:"식"},
    {id:"i5", name:"우물 무몰딩 목공", price:1050000, unit:"식 (PVC 대체)", options:["라운드","직각"]},
    {id:"i6", name:"실링팬", price:320000, unit:"대 (모델별 단가 다름 — 직접 수정)", editable:true},
    {id:"i7", name:"배선비용", price:50000, unit:"실링팬 1대당"},
    {id:"i8", name:"실링팬 보강", price:150000, unit:"실링팬 1대당"},
    {id:"i9", name:"실린더", price:50000, unit:"개"},
    {id:"i10", name:"현관 하부센서(간접 센서등)", price:150000, unit:"개소"},
    {id:"i11", name:"욕실 센서등", price:100000, unit:"개소"},
    {id:"i12", name:"스마트 스위치(원격 조작)", price:150000, unit:"개"},
    {id:"i13", name:"우물 세로면 3.8m 이상 추가", price:150000, unit:"개소"},
    {id:"i14", name:"마그네틱 조명", price:250000, unit:"미터당"},
    {id:"i15", name:"라인조명", price:200000, unit:"미터당"},
    {id:"i16", name:"멀티매입등", price:70000, unit:"개당"},
    {id:"i17", name:"움푹 확산형 다운라이트", price:40000, unit:"개당"},
    {id:"i18", name:"COB 다운라이트", price:35000, unit:"개당"},
    {id:"i19", name:"펜던트 설치", price:30000, unit:"개"},
    {id:"i20", name:"배선 작업", price:150000, unit:"식 (현장별 단가 다름 — 직접 수정)", editable:true}
  ];
