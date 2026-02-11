# 量化開發三大架構概覽 (Framework Overview)

本頁面提供三大架構的高階資料流向圖。請依據你的策略屬性選擇最適合的路線。

---

## 🗺️ 決策路徑圖
```mermaid
graph TD
    Start((開始新策略)) --> Q1{策略類型?}
    
    Q1 -- 基本面/財報選股 --> ArchA[財報選股架構DataFrame Approach]
    Q1 -- 技術指標/單一個股 --> ArchB[技術指標架構Loop Approach]
    Q1 -- 全市場掃描/籌碼因子 --> ArchC[Pipeline因子架構Pipeline Approach]
    
    ArchA --> ExA[範例: 多因子選股Dreman逆向投資]
    ArchB --> ExB[範例: MACD布林通道]
    ArchC --> ExC[範例: Momentum跟隨大戶]
    
    style ArchA fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style ArchB fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    style ArchC fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px
```

---

## 📊 架構性能對比表

| 特性 | 財報選股架構 | 技術指標架構 | Pipeline因子架構 |
| :--- | :---: | :---: | :---: |
| **適用股票數** | 50-200檔 | 1-10檔 | 500-2000檔 |
| **運算速度** | 🟢 快 | 🟡 中 | 🟢 快 |
| **開發難度** | 🟢 易 | 🟢 易 | 🔴 難 |
| **彈性** | 🟡 中 | 🟢 高 | 🔴 低 |
| **記憶體需求** | 🟢 低 | 🟢 低 | 🔴 高 |
| **典型調倉頻率** | 季度/月度 | 每日 | 每日/每月 |

---

## 🏗️ 架構 A：財報選股架構 (DataFrame Approach)

**核心概念：** 先在 Python/DataFrame 把名單算好，回測只是「照表操課」。  
**關鍵函數：** `compute_stock(date, data)`
```mermaid
graph TD
    subgraph Prep [事前準備 Pre-Backtest]
    A1[設定股票池 & API Key] --> A2[TejToolAPI.get_history_data抓取完整財報數據]
    A2 --> A3[compute_stock 函數運算選股邏輯]
    A3 --> A4[產出靜態 Ticker List包含每期日期]
    A4 --> A5[計算換股日 modified_day通常為季度末]
    end

    subgraph Run [回測執行 Run Backtest]
    A5 --> B1[simple_ingest匯入價量資料]
    B1 --> B2[zipline.run_algorithm啟動回測引擎]
    B2 --> B3{handle_data 每日檢查:是換股日?}
    B3 -- Yes --> B4[context.state = True標記隔日換股]
    B3 -- No --> B5[持有不動 Hold]
    B4 --> B6[隔日盤中order_target_percent等權重調倉]
    end
    
    style Prep fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style Run fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style A3 fill:#ffccbc,stroke:#d84315,stroke-width:2px
    style B6 fill:#ffccbc,stroke:#d84315,stroke-width:2px
```

**📌 關鍵特徵：**

- ✅ 避免前視偏差：使用 `context.state` 延遲到隔日下單
- ✅ 數據透明：所有篩選邏輯都在 `compute_stock()` 中
- ❌ 不適合高頻：重新運算成本高

---

## ⚡ 架構 B：技術指標架構 (Loop Approach)

**核心概念：** 在回測的每一天，即時抓過去 K 線來算指標。  
**關鍵函數：** `handle_data(context, data)`
```mermaid
graph TD
    subgraph Prep [事前準備]
    C1[設定標的清單 StockList通常 1-10 檔] --> C2[simple_ingest匯入行情資料]
    end

    subgraph Run [回測執行]
    C2 --> D1[zipline.run_algorithm回測引擎]
    D1 --> D2[handle_data每日自動觸發]
    D2 --> D3[data.history 函數抓取歷史 K 線]
    D3 --> D4[即時計算指標talib.MACD / EMA / 標準差]
    D4 --> D5{訊號判斷 Signal}
    D5 -- Buy --> D6[order_target 買入]
    D5 -- Sell --> D7[order_target 賣出]
    D5 -- Hold --> D8[不動作]
    D6 & D7 --> D9[record 函數記錄訊號與價格]
    end

    style Prep fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style Run fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style D4 fill:#ffccbc,stroke:#d84315,stroke-width:2px
    style D5 fill:#c5e1a5,stroke:#558b2f,stroke-width:2px
```

**📌 關鍵特徵：**

- ✅ 簡單直觀：邏輯與傳統回測一致
- ✅ 彈性高：可隨時調整參數
- ❌ 效能瓶頸：大量股票會很慢（需要 loop）

---

## 🚀 架構 C：Pipeline 因子架構 (Pipeline Approach)

**核心概念：** 使用 Zipline 核心引擎，處理全市場大規模運算最快。  
**關鍵函數：** `make_pipeline()`, `before_trading_start()`
```mermaid
graph TD
    subgraph Prep [事前準備]
    E1[外部資料 CSV/API例: 籌碼、財報] --> E2[Custom_loader 函數轉換成 Zipline 格式]
    E2 --> E3[CustomDataset + DataFrameLoader註冊為 Pipeline 資料源]
    E3 --> E4[make_pipeline 函數定義因子與濾網]
    E4 --> E5[CustomFactor.compute自定義運算邏輯]
    end

    subgraph Run [回測執行]
    E5 --> F1[zipline.run_algorithmcustom_loader=transform_data]
    F1 --> F2[before_trading_start盤前自動運算]
    F2 --> F3[context.trades = pipeline_output取得當日訊號 DataFrame]
    F3 --> F4[schedule_function排程交易函數]
    F4 --> F5[rebalance_start / end整批下單邏輯]
    F5 --> F6[order_target_value按風險分配資金]
    end

    style Prep fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style Run fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style E3 fill:#ffccbc,stroke:#d84315,stroke-width:2px
    style E5 fill:#ffccbc,stroke:#d84315,stroke-width:2px
    style F3 fill:#c5e1a5,stroke:#558b2f,stroke-width:2px
```

**📌 關鍵特徵：**

- ✅ 極致效能：全市場 2000 檔股票也能秒算
- ✅ 避免前視偏差：Pipeline 引擎自動處理
- ❌ 學習曲線陡峭：需理解 CustomFactor、DataFrameLoader
- ❌ Debug 困難：錯誤訊息不直觀

---

## 💡 如何選擇？快速檢查表
```mermaid
graph LR
    A[你的策略] --> B{股票數量?}
    B -- <10檔 --> C[技術指標架構]
    B -- 10-200檔 --> D{需要外部數據?}
    B -- >200檔 --> E[Pipeline因子架構]
    
    D -- 需要財報 --> F[財報選股架構]
    D -- 只用價量 --> C
    
    style C fill:#fff3e0,stroke:#f57c00
    style F fill:#e3f2fd,stroke:#1976d2
    style E fill:#f3e5f5,stroke:#7b1fa2
```

**👉 Next Step:**  
前往對應架構的詳細頁面，複製 Code Template 開始開發！