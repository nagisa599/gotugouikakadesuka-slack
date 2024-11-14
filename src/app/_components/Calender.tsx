"use client";
import React, { useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { format, isToday } from "date-fns";
import { ja } from "date-fns/locale";
import { iosSlackStamp, slackStamp } from "~/app/constants/slack_stamp";
import { useToast } from "~/context/ToastContext";
import { text } from "stream/consumers";
// eslint-disable-next-line
registerLocale("ja", ja);

const Calendar = () => {
  const { showToast, closeToast } = useToast();
  const initialText = "以下の日程でご都合いかがでしょうか。\n";
  const [input, setInput] = useState<string>(initialText);
  const [timeChecker, setTimeChecker] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTextAtCursor = (text: string) => {
    // 参照していない場合は、何もしない
    if (!textareaRef.current) return;
    //　テキストエリアの現在の選択範囲の開始位置と終了位置を取得
    const { selectionStart, selectionEnd } = textareaRef.current;
    console.log(selectionStart, selectionEnd);
    const currentValue = input;

    const newValue =
      currentValue.slice(0, selectionStart) +
      text +
      currentValue.slice(selectionEnd);

    setInput(newValue);

    setTimeout(() => {
      textareaRef.current?.setSelectionRange(
        selectionStart + text.length,
        selectionStart + text.length,
      );
      textareaRef.current?.focus();
    }, 0);
  };

  const handleChange = (date: Date | null) => {
    if (date) {
      // eslint-disable-next-line
      const formattedDate = format(date, "MMMM d日 (eeee)", { locale: ja });
      // 初期テキストがある場合、その後に日付を追加
      setInput(
        (prevInput) =>
          `${initialText}${prevInput.replace(initialText, "").trim()}\n${formattedDate}`,
      );
    } else {
      console.log("選択された日付がありません");
    }
  };

  const handleTimeChange = (time: Date | null) => {
    if (time) {
      // eslint-disable-next-line
      const formattedTime = format(time, "HH:mm", { locale: ja });
      const isEven = timeChecker.length % 2 === 0;
      const timeText = isEven ? ` ${formattedTime}~` : `${formattedTime},`;
      // eslint-disable-next-line
      setTimeChecker((prev) => [...prev, formattedTime]);
      insertTextAtCursor(timeText);
    } else {
      console.log("選択された時間がありません");
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };
  const handleIOSCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      const message = successful
        ? "コピーに成功しました"
        : "コピーに失敗しました";
      showToast(message, successful ? "success" : "error");
    } catch (err) {
      showToast("slackコピーに失敗しました", "error");
    }

    document.body.removeChild(textArea);
  };

  const handleSlackCopy = () => {
    const isIOS = () => {
      const agent = window.navigator.userAgent;
      return /iPad|iPhone|iPod/.test(agent);
    };
    const lines = input.split("\n").filter((line) => line.trim() !== ""); // 空行を除外

    if (isIOS()) {
      const stampedLines = lines
        .map((line, index) => {
          if (index === 0) return line; // 1行目は絵文字を追加しない
          const emoji = iosSlackStamp[(index - 1) % slackStamp.length]; // 2行目以降に絵文字を追加
          return `${emoji} ${line}`;
        })
        .join("\n");
      handleIOSCopy(stampedLines);
    } else {
      const stampedLines = lines
        .map((line, index) => {
          if (index === 0) return line; // 1行目は絵文字を追加しない
          const emoji = slackStamp[(index - 1) % slackStamp.length]; // 2行目以降に絵文字を追加
          return `${emoji} ${line}`;
        })
        .join("\n");
      navigator.clipboard
        .writeText(stampedLines)
        .then(() => showToast("slackコピーしました", "success"))
        .catch(() => showToast("コピーに失敗しました", "error"));
    }
  };
  const handleCopy = () => {
    const isIOS = () => {
      const agent = window.navigator.userAgent;
      return /iPad|iPhone|iPod/.test(agent);
    };
    const lines = input.split("\n").filter((line) => line.trim() !== ""); // 空行を除外

    if (isIOS()) {
      const stampedLines = lines
        .map((line, index) => {
          return `${line}`;
        })
        .join("\n");
      handleIOSCopy(stampedLines);
    } else {
      const stampedLines = lines
        .map((line, index) => {
          return `${line}`;
        })
        .join("\n");
      navigator.clipboard
        .writeText(stampedLines)
        .then(() => showToast("コピーしました", "success"))
        .catch(() => showToast("コピーに失敗しました", "error"));
    }
  };
  return (
    <div>
      <DatePicker
        inline
        dateFormat="MMMM d日 (eee)"
        onChange={handleChange}
        dayClassName={(date) => (isToday(date) ? "highlight-today" : "")}
        locale="ja"
      />
      <DatePicker
        inline
        onChange={handleTimeChange}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={15}
        timeFormat="HH:mm"
        dateFormat="HH:mm"
        locale="ja"
      />
      <textarea
        ref={textareaRef}
        name="copy-text"
        rows={8}
        value={input}
        onChange={handleTextChange}
        className="h-80 w-full resize-none rounded-lg border border-gray-300 bg-white p-3 text-gray-700"
      />

      <div className="flex gap-2">
        <button
          onClick={() => setInput(initialText)}
          className="rounded bg-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-400"
        >
          リセット
        </button>
        <button
          onClick={() => handleCopy()}
          className="rounded bg-green-500 px-4 py-2 text-white transition hover:bg-green-600"
        >
          コピー
        </button>
        <button
          onClick={handleSlackCopy}
          className="flex items-center gap-2 rounded bg-yellow-400 px-4 py-2 text-white transition hover:bg-blue-600"
        >
          <img src="/assets/slack.png" alt="Slack icon" className="h-8" />
        </button>
      </div>
    </div>
  );
};

export default Calendar;
